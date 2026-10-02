package com.project.ComplaintApp.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.jsonwebtoken.ExpiredJwtException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        System.out.println("========== JWT FILTER ==========");
        System.out.println("Request: " + request.getMethod() + " " + request.getRequestURI());
        System.out.println("Authorization Header Present: " + (authHeader != null));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = authHeader.substring(7);

            System.out.println("Bearer token received.");

            var claims = jwtUtil.extractClaims(jwt);

            System.out.println("JWT Claims: " + claims);

            String userId = claims.get("userId").toString();

            String userRole = claims.get("role").toString();

            System.out.println("User ID from JWT: " + userId);

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + userRole);

            if (jwtUtil.isTokenValid(jwt)) {

                System.out.println("JWT IS VALID");

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        List.of(authority));

                SecurityContextHolder.getContext()
                        .setAuthentication(authToken);

                System.out.println("Authentication set successfully.");
                System.out.println(
                        "Authenticated User: "
                                + SecurityContextHolder.getContext()
                                        .getAuthentication().getAuthorities());

            } else {
                System.out.println("JWT IS INVALID");
            }

        } catch (ExpiredJwtException e) {

            System.out.println("JWT expired. Please login again.");

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");

            response.getWriter().write(
                    "{\"message\":\"JWT token has expired. Please login again.\"}");
            return;
        }

        System.out.println("================================");

        filterChain.doFilter(request, response);
    }
}
