// com.petadoption.config.StaticResourceConfig.java
package com.petadoption.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get the absolute path to your project directory
        String currentDir = System.getProperty("user.dir");
        String uploadPath = "file:" + currentDir + "/Uploads/";

        System.out.println("=== STATIC RESOURCE CONFIG ===");
        System.out.println("Serving files from: " + uploadPath);

        // Serve files from Uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath)
                .setCachePeriod(3600);

        registry.addResourceHandler("/Uploads/**")
                .addResourceLocations(uploadPath)
                .setCachePeriod(3600);
    }
}