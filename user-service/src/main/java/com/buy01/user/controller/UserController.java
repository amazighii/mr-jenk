package com.buy01.user.controller;

import com.buy01.user.dto.PublicUserProfileResponse;
import com.buy01.user.dto.UpdateAvatarRequest;
import com.buy01.user.dto.UserProfileResponse;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.buy01.user.dto.UpdateAvatarResponse;
import com.buy01.user.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMe(Authentication auth) {
        String userId = auth.getName();  // set by JwtFilter as the principal

        UserProfileResponse response = userService.getMe(userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<PublicUserProfileResponse> getPublicProfile(@PathVariable("id") String userId) {
        PublicUserProfileResponse response = userService.getPublicProfile(userId);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UpdateAvatarResponse> updateAvatar(
            Authentication auth,
            @Valid @RequestBody UpdateAvatarRequest request
    ) {
        String userId = auth.getName();

        UpdateAvatarResponse response = userService.updateAvatar(userId, request);

        return ResponseEntity.ok(response);
    }
}
