package com.buy01.user.dto;

import lombok.Data;

@Data
public class UserProfileResponse {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private String role;
}