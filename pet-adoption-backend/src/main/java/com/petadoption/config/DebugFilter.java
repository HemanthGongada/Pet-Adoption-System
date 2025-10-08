//com.petadoption.config.DebugFilter.java
package com.petadoption.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DebugFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(DebugFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String uri = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();
        String authHeader = httpRequest.getHeader("Authorization");

        logger.info("=== REQUEST DEBUG ===");
        logger.info("Method: {}, URI: {}", method, uri);
        logger.info("Authorization Header: {}", authHeader);
        logger.info("SecurityContext Authentication: {}",
                SecurityContextHolder.getContext().getAuthentication());

        chain.doFilter(request, response);

        logger.info("=== RESPONSE DEBUG ===");
        logger.info("Response Status: {}", httpResponse.getStatus());
        logger.info("=== END DEBUG ===");
    }
}