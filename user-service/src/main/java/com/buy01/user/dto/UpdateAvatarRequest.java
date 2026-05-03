package com.buy01.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class UpdateAvatarRequest {

    @NotBlank(message = "Avatar URL is required")
    @URL(message = "Avatar URL must be valid")
    private String avatarUrl;
}
