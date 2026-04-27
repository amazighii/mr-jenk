package com.buy01.media.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.buy01.media.dto.ResponseAddMediaEntity;
import com.buy01.media.services.MediaService;

@RestController
@RequestMapping("/api/media/images")
public class MediaController {
    private final MediaService mediaService;


    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping
    public ResponseEntity<ResponseAddMediaEntity> addMediaEntity(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-Id") String sellerId
    ) {
        ResponseAddMediaEntity response = mediaService.addMediaEntity(file, sellerId);
        return ResponseEntity.status(201).body(response);
    }
}
