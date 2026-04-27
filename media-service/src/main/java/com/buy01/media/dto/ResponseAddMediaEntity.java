package com.buy01.media.dto;

import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class ResponseAddMediaEntity {
    private String id;
    private String filename;
    private String contentType;
    private String addedAt;
}