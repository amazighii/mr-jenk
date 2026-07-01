package com.buy01.user.service;

import org.springframework.stereotype.Service;

import com.buy01.user.dto.UpdateAvatarRequest;
import com.buy01.user.dto.UpdateAvatarResponse;
import com.buy01.user.dto.PublicUserProfileResponse;
import com.buy01.user.dto.UserProfileResponse;
import com.buy01.user.exception.UserNotFoundException;
import com.buy01.user.model.User;
import com.buy01.user.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileResponse getMe(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setRole(user.getRole().name());

        return response;
    }

    public PublicUserProfileResponse getPublicProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        PublicUserProfileResponse response = new PublicUserProfileResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setRole(user.getRole().name());

        return response;
    }

    public UpdateAvatarResponse updateAvatar(String userId, UpdateAvatarRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setAvatarUrl(request.getAvatarUrl());
        userRepository.save(user);

        return new UpdateAvatarResponse("Avatar has been updated successfully");
    }
}
