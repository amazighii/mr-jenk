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
import org.springframework.security.crypto.password.PasswordEncoder;

import com.buy01.user.dto.AuthResponse;
import com.buy01.user.dto.LoginRequest;
import com.buy01.user.dto.RegisterRequest;
import com.buy01.user.exception.EmailAlreadyInUseException;
import com.buy01.user.exception.InvalidCredentialsException;
import com.buy01.user.model.Role;
import com.buy01.user.model.User;
import com.buy01.user.repository.UserRepository;
import com.buy01.user.security.JwtUtil;
import com.buy01.user.service.AuthService;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    JwtUtil jwtUtil;

    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    AuthService authService;

    @Test
    void register_ShouldReturnAuthResponse_WhenSuccessful() {
        // Arange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("amazighii@gmail.com");
        request.setPassword("password123");
        request.setFirstName("abdessamad");
        request.setLastName("mazighi");
        request.setRole(Role.CLIENT);

        User user = new User();
        user.setId("TestId");
        user.setEmail("amazighii@gmail.com");
        user.setRole(Role.CLIENT);

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("mocked_hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name()))
                .thenReturn("mocked_jwt_token");

        // Act
        AuthResponse response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("mocked_jwt_token", response.getToken());
        assertEquals("CLIENT", response.getRole());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("amazighii@gmail.com");
        request.setPassword("password123");
        request.setFirstName("abdessamad");
        request.setLastName("mazighi");
        request.setRole(Role.CLIENT);

        when(userRepository.existsByEmail("amazighii@gmail.com")).thenReturn(true);

        assertThrows(EmailAlreadyInUseException.class, () -> {
            authService.register(request);
        });

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_ShouldReturnAuthResponse_WhenCredentialsAreValid() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("amazighii@gmail.com");
        request.setPassword("password123");

        User user = new User();
        user.setId("TestId");
        user.setEmail("amazighii@gmail.com");
        user.setPassword("mocked_hashed_password");
        user.setRole(Role.CLIENT);

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name()))
                .thenReturn("mocked_jwt_token");

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("mocked_jwt_token", response.getToken());
        assertEquals("CLIENT", response.getRole());
        assertEquals("TestId", response.getUserId());
    }

    @Test
    void login_ShouldThrowException_WhenUserDoesNotExist() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("missing@gmail.com");
        request.setPassword("password123");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(InvalidCredentialsException.class, () -> {
            authService.login(request);
        });

        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void login_ShouldThrowException_WhenPasswordIsInvalid() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("amazighii@gmail.com");
        request.setPassword("wrong_password");

        User user = new User();
        user.setId("TestId");
        user.setEmail("amazighii@gmail.com");
        user.setPassword("mocked_hashed_password");
        user.setRole(Role.CLIENT);

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(false);

        // Act + Assert
        assertThrows(InvalidCredentialsException.class, () -> {
            authService.login(request);
        });

        verify(jwtUtil, never()).generateToken(any(), any(), any());
    }
}
