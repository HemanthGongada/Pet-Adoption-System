// com.petadoption.config.WebConfig.java
package com.petadoption.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files from the file system
        String uploadDir = Paths.get(".").toAbsolutePath().normalize().toString() + "/Uploads/";

        registry.addResourceHandler("/Uploads/**")
                .addResourceLocations("file:" + uploadDir)
                .setCachePeriod(3600);

        // Also add /uploads/ for case-insensitive access
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir)
                .setCachePeriod(3600);
    }
}