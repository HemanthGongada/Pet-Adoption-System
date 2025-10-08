package com.petadoption.config;

import com.petadoption.service.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
    private final AuthenticationConfiguration authenticationConfiguration;

    public SecurityConfig(AuthenticationConfiguration authenticationConfiguration) {
        this.authenticationConfiguration = authenticationConfiguration;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        return new JwtAuthenticationFilter(jwtService, userDetailsService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtService jwtService, UserDetailsService userDetailsService) throws Exception {
        JwtAuthenticationFilter jwtAuthFilter = jwtAuthenticationFilter(jwtService, userDetailsService);

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll() // ⭐ ADD THIS LINE - CRITICAL!

                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/test/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/debug/**").authenticated()
                        .requestMatchers("/api/pets/add", "/api/pets/update/**", "/api/pets/delete/**").hasAnyAuthority("ROLE_SHELTER", "ROLE_ADMIN")
                        .requestMatchers("/api/pets/**").authenticated()
                        .requestMatchers("/api/adoptions/user/**").hasAnyAuthority("ROLE_USER", "ROLE_SHELTER", "ROLE_ADMIN")
                        .requestMatchers("/api/adoptions/create").hasAuthority("ROLE_USER")
                        .requestMatchers("/api/adoptions/manage/**").hasAnyAuthority("ROLE_SHELTER", "ROLE_ADMIN")
                        .requestMatchers("/api/adoptions/**").authenticated()
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/reports/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/user/**").authenticated()
                        .requestMatchers("/api/appointments/create").hasAuthority("ROLE_USER")
                        .requestMatchers("/api/appointments/user").hasAuthority("ROLE_USER")
                        .requestMatchers("/api/appointments/shelter").hasAnyAuthority("ROLE_SHELTER", "ROLE_ADMIN")
                        .requestMatchers("/api/appointments/manage/**").hasAnyAuthority("ROLE_SHELTER", "ROLE_ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exception -> exception
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            logger.error("=== ACCESS DENIED ===");
                            logger.error("URI: {}", request.getRequestURI());
                            logger.error("Method: {}", request.getMethod());
                            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                                logger.error("User: {}", SecurityContextHolder.getContext().getAuthentication().getName());
                                logger.error("Authorities: {}", SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                            } else {
                                logger.error("User: NOT_AUTHENTICATED");
                            }
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write("Access denied: " + accessDeniedException.getMessage());
                        })
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager() throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}