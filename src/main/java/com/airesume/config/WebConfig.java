package com.airesume.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 首页
        registry.addViewController("/").setViewName("forward:/index.html");
        
        // 简历详情页
        registry.addViewController("/resume").setViewName("forward:/resume.html");
        
        // 简历编辑页
        registry.addViewController("/resume/edit/{id}").setViewName("forward:/edit.html");
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 添加静态资源处理器，确保能够访问/images/目录下的资源
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
    }
} 