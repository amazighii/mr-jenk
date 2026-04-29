package com.buy01.media.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.buy01.media.dto.DeleteMediaResponse;
import com.buy01.media.dto.ResponseAddMediaEntityWrapper;
import com.buy01.media.services.MediaService;

import jakarta.websocket.server.PathParam;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;

import com.buy01.media.dto.UpdateMediaResponse;

@RestController
@RequestMapping("/api/media/images")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping
    public ResponseEntity<ResponseAddMediaEntityWrapper> addMediaEntity(
            @RequestParam("file") MultipartFile[] files,
            @RequestHeader("X-User-Id") String sellerId
    ) {
        ResponseAddMediaEntityWrapper response = mediaService.addMediaEntity(files, sellerId);
        return ResponseEntity.status(201).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UpdateMediaResponse> updateMedia(
            @PathVariable("id") String productId,
            @RequestPart("newFiles") MultipartFile[] newFiles,
            @RequestPart("oldUrls") String[] oldUrls,
            @RequestHeader("X-User-Id") String sellerId

    ) {

        UpdateMediaResponse response = mediaService.updateMedia(newFiles, oldUrls, sellerId, productId);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DeleteMediaResponse> deleteSingleMedia(
            @PathVariable("id") String mediaId,
            @RequestHeader("X-User-Id") String sellerId
    ) {
        DeleteMediaResponse response = mediaService.deleteSingleMedia(mediaId, sellerId);

        return ResponseEntity.ok(response);
    }
}
