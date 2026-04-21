package com.buy01.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

        @Bean
        public RouteLocator routes(RouteLocatorBuilder builder) {
                return builder.routes()

                                .route("user-service", r -> r
                                                .path("/api/auth/**", "/api/users/**")
                                                .uri("lb://user-service"))

                                .route("product-service", r -> r
                                                .path("/api/products", "/api/products/**")
                                                .uri("lb://product-service"))

                                .route("media-service", r -> r
                                                .path("/api/media/**")
                                                .uri("lb://media-service"))

                                .build();
        }
}