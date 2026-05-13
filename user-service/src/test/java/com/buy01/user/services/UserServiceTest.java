package com.buy01.user.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.buy01.user.dto.UpdateAvatarRequest;
import com.buy01.user.dto.UpdateAvatarResponse;
import com.buy01.user.dto.UserProfileResponse;
import com.buy01.user.exception.UserNotFoundException;
import com.buy01.user.model.Role;
import com.buy01.user.model.User;
import com.buy01.user.repository.UserRepository;
import com.buy01.user.service.UserService;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    UserRepository userRepository;

    @InjectMocks
    UserService userService;

    @Test
    void getMe_ShouldReturnUserProfile_WhenUserExists() {
        // Arrange
        User user = new User();
        user.setId("TestId");
        user.setEmail("amazighii@gmail.com");
        user.setFirstName("abdessamad");
        user.setLastName("mazighi");
        user.setAvatarUrl("https://example.com/avatar.png");
        user.setRole(Role.CLIENT);

        when(userRepository.findById("TestId")).thenReturn(Optional.of(user));

        // Act
        UserProfileResponse response = userService.getMe("TestId");

        // Assert
        assertNotNull(response);
        assertEquals("TestId", response.getId());
        assertEquals("amazighii@gmail.com", response.getEmail());
        assertEquals("abdessamad", response.getFirstName());
        assertEquals("mazighi", response.getLastName());
        assertEquals("https://example.com/avatar.png", response.getAvatarUrl());
        assertEquals("CLIENT", response.getRole());
    }

    @Test
    void getMe_ShouldThrowException_WhenUserDoesNotExist() {
        // Arrange
        when(userRepository.findById("MissingId")).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(UserNotFoundException.class, () -> {
            userService.getMe("MissingId");
        });
    }

    @Test
    void updateAvatar_ShouldUpdateAvatar_WhenUserExists() {
        // Arrange
        UpdateAvatarRequest request = new UpdateAvatarRequest();
        request.setAvatarUrl("https://example.com/new-avatar.png");

        User user = new User();
        user.setId("TestId");
        user.setAvatarUrl("https://example.com/old-avatar.png");

        when(userRepository.findById("TestId")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        // Act
        UpdateAvatarResponse response = userService.updateAvatar("TestId", request);

        // Assert
        assertNotNull(response);
        assertEquals("Avatar has been updated successfully", response.getMessage());
        assertEquals("https://example.com/new-avatar.png", user.getAvatarUrl());
        verify(userRepository).save(user);
    }

    @Test
    void updateAvatar_ShouldThrowException_WhenUserDoesNotExist() {
        // Arrange
        UpdateAvatarRequest request = new UpdateAvatarRequest();
        request.setAvatarUrl("https://example.com/new-avatar.png");

        when(userRepository.findById("MissingId")).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(UserNotFoundException.class, () -> {
            userService.updateAvatar("MissingId", request);
        });

        verify(userRepository, never()).save(any(User.class));
    }
}
