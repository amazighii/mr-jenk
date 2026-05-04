
package com.buy01.user.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InternalRequestFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

    //     String internalHeader = request.getHeader("X-Internal-Request");
    //     System.out.println("\nInternalRequestFilter - X-Internal-Request header: " + internalHeader + "\n");
    //     if (internalHeader == null || !internalHeader.equals("true")) {
    //         response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    //         return;
    //     }

        filterChain.doFilter(request, response);
    }
}