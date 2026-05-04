package com.buy01.gateway.security;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
// @RequiredArgsConstructor
// @AllArgsConstructor
// @NoArgsConstructor

public class AuthenticationFilter implements GlobalFilter, Ordered {

    // private final jwtUtil;
    @Autowired
    private JwtUtils jwtUtil;

    // private AuthenticationFilter(JwtUtils jwtUtil) {
    // this.jwtUtil = jwtUtil;
    // }
    // Routes that don't need a token
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/products", // Allow GET /api/products without auth
            "/actuator/health");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().toString();

        // Skip auth for public routes
        if (isPublic(path)) {
            System.out.println("Public path accessed: " + path);
            return chain.filter(exchange);
        }
        exchange.getRequest().getHeaders().forEach((k, v) -> System.out.println("[ " + k + ": " + v + " ]"));
        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        // No token at all → 401
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("\nMissing or malformed Authorization header: " + authHeader + "\n");
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);

            Map<String, String> message = Map.of("message", "Unauthorized access");

            return exchange.getResponse().writeWith(Mono.fromCallable(() -> {
                ObjectMapper objectMapper = new ObjectMapper();
                return exchange.getResponse().bufferFactory().wrap(objectMapper.writeValueAsBytes(message));
            }));
        }

        String token = authHeader.substring(7);

        // Invalid or expired token → 401
        if (!jwtUtil.isTokenValid(token)) {
            System.out.println("\nInvalid token in gateway: " + token + "\n");
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
            Map<String, String> message = Map.of("message", "Unauthorized access");

            return exchange.getResponse().writeWith(Mono.fromCallable(() -> {
                ObjectMapper objectMapper = new ObjectMapper();
                return exchange.getResponse().bufferFactory().wrap(objectMapper.writeValueAsBytes(message));
            }));
        }

        // Token is valid — extract claims and add headers
        String userId = jwtUtil.extractUserId(token);
        String role = jwtUtil.extractRole(token);

        // Mutate the request to add the headers before forwarding
        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(exchange.getRequest().mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Role", role)
                        .build())
                .build();

        return chain.filter(mutatedExchange);
    }

    @Override
    public int getOrder() {
        return -1; // Run before all other filters
    }

    private boolean isPublic(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith)
                || path.startsWith("/api/products") && path.contains("GET");
    }
}
