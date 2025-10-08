//com.petadoption.config.JwtAuthenticationFilter.java
package com.petadoption.config;

import com.petadoption.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String requestUri = request.getRequestURI();
        final String authHeader = request.getHeader("Authorization");

        logger.info("=== JWT FILTER START ===");
        logger.info("Request URI: {}", requestUri);
        logger.info("Authorization Header present: {}", authHeader != null);

        // Skip JWT validation for public endpoints
        if (requestUri.startsWith("/api/auth/") || requestUri.startsWith("/api/test/decode-token")) {
            logger.info("Skipping JWT for public endpoint");
            filterChain.doFilter(request, response);
            return;
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("No Bearer token found");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = authHeader.substring(7);
            logger.info("JWT token length: {}", jwt.length());

            String username = jwtService.extractUsername(jwt);
            logger.info("Extracted username: {}", username);

            if (username == null) {
                logger.error("Failed to extract username from JWT");
                filterChain.doFilter(request, response);
                return;
            }

            // Always clear the context before setting new authentication
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                logger.info("SecurityContext is empty, loading user details");

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                logger.info("Loaded user: {}, authorities: {}", userDetails.getUsername(), userDetails.getAuthorities());

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    logger.info("Token is valid, setting authentication");

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    logger.info("=== AUTHENTICATION SET SUCCESSFULLY ===");
                    logger.info("Authenticated user: {}", userDetails.getUsername());
                    logger.info("Authorities: {}", userDetails.getAuthorities());

                } else {
                    logger.error("Token is INVALID for user: {}", username);
                }
            } else {
                logger.info("SecurityContext already has authentication: {}",
                        SecurityContextHolder.getContext().getAuthentication().getName());
            }

        } catch (Exception e) {
            logger.error("JWT Filter Error: {}", e.getMessage(), e);
            // Don't set authentication if there's an error
            SecurityContextHolder.clearContext();
        }

        logger.info("=== JWT FILTER END ===");
        filterChain.doFilter(request, response);
    }
}