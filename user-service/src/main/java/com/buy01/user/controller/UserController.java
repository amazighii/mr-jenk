package com.buy01.user.controller;

import com.buy01.user.dto.UserProfileResponse;
import com.buy01.user.model.User;
import com.buy01.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMe(Authentication auth) {
        String userId = auth.getName();  // set by JwtFilter as the principal

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setRole(user.getRole().name());

        return ResponseEntity.ok(response);
    }
}