package com.buy01.user.dto;

import lombok.Data;

@Data
public class PublicUserProfileResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private String role;
}
