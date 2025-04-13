package com.airesume.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;

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
                .addResourceLocations("classpath:/static/images/")
                .setCachePeriod(3600)
                .resourceChain(true);
                
        // 添加CSS文件处理器
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/")
                .setCachePeriod(3600)
                .resourceChain(true);
                
        // 添加模板文件处理器
        registry.addResourceHandler("/templates/**")
                .addResourceLocations("classpath:/static/templates/")
                .setCachePeriod(3600)
                .resourceChain(true);
                
        // 添加根目录下的静态资源处理器
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600)
                .resourceChain(true);
    }
    
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
            .mediaType("css", MediaType.valueOf("text/css"))
            .mediaType("js", MediaType.valueOf("application/javascript"))
            .mediaType("html", MediaType.valueOf("text/html"))
            .mediaType("json", MediaType.valueOf("application/json"))
            .mediaType("png", MediaType.valueOf("image/png"))
            .mediaType("jpg", MediaType.valueOf("image/jpeg"))
            .mediaType("jpeg", MediaType.valueOf("image/jpeg"))
            .mediaType("gif", MediaType.valueOf("image/gif"))
            .mediaType("svg", MediaType.valueOf("image/svg+xml"))
            .mediaType("woff", MediaType.valueOf("font/woff"))
            .mediaType("woff2", MediaType.valueOf("font/woff2"))
            .mediaType("ttf", MediaType.valueOf("font/ttf"))
            .mediaType("eot", MediaType.valueOf("application/vnd.ms-fontobject"));
    }
} 