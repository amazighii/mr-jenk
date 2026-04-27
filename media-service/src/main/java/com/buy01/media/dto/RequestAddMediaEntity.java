package com.buy01.media.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RequestAddMediaEntity {
    private MultipartFile file; // format: binary. 
}