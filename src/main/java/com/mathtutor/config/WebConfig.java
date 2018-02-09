package com.mathtutor.config;

import com.mathtutor.thymeleaf.ThymeleafLayoutInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.thymeleaf.extras.springsecurity4.dialect.SpringSecurityDialect;
import org.thymeleaf.spring4.templateresolver.SpringResourceTemplateResolver;


/**
 * jpa-project
 * Created by Venkatesh on 5/12/17.
 */
@Configuration
@EnableWebMvc
public class WebConfig extends WebMvcConfigurerAdapter {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new ThymeleafLayoutInterceptor());
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/css/**")
                .addResourceLocations("/resources/public/css/")
                .setCachePeriod(10800);
        registry.addResourceHandler("/js/**")
                .addResourceLocations("/resources/public/js/")
                .setCachePeriod(10800);
        registry.addResourceHandler("/fonts/**")
                .addResourceLocations("/resources/public/fonts/")
                .setCachePeriod(10800);
    }
    @Bean
    public SpringSecurityDialect securityDialect() {
        return new SpringSecurityDialect();
    }

}
