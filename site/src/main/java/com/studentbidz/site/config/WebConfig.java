package com.studentbidz.site.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Paths;
import org.springframework.lang.NonNull;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        String absolutePath = "file:" + Paths.get("uploads").toAbsolutePath().toString() + "/";
        System.out.println("[WebConfig] Serving images from: " + absolutePath);
        registry.addResourceHandler("/images/**")
                .addResourceLocations(absolutePath);
    }
} 

