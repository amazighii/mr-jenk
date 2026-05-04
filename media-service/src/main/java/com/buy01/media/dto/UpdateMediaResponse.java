package com.buy01.media.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpdateMediaResponse {
    private String message;
    private ResponseAddMediaEntityWrapper response;
}
