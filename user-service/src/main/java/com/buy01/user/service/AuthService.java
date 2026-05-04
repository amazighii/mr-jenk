package com.buy01.user.service;

import com.buy01.user.dto.*;
import com.buy01.user.exception.EmailAlreadyInUseException;
import com.buy01.user.exception.InvalidCredentialsException;
import com.buy01.user.model.User;
import com.buy01.user.repository.UserRepository;
import com.buy01.user.security.JwtUtil;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    private org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    @PostConstruct
    public void checkDb() {
        System.out.println(">>> ACTUAL DB USED = " + mongoTemplate.getDb().getName());
    }

    @Autowired
    private org.springframework.core.env.Environment env;

    @PostConstruct
    public void debugMongo() {
        System.out.println("URI = " + env.getProperty("spring.data.mongodb.uri"));
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyInUseException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());

        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(
                saved.getId(), saved.getEmail(), saved.getRole().name());

        return new AuthResponse(token, saved.getRole().name(), saved.getId());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(
                user.getId(), user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getRole().name(), user.getId());
    }
}
