package com.buy01.media.services;

import java.util.Date;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.buy01.media.dto.ResponseAddMediaEntity;
import com.buy01.media.exception.EmptyMediaFileException;
import com.buy01.media.exception.InvalidMediaTypeException;
import com.buy01.media.exception.MediaPersistenceException;
import com.buy01.media.exception.MediaStorageException;
import com.buy01.media.models.Media;
import com.buy01.media.repositories.MediaRepository;

@Service
public class MediaService {

    private final MinioService minioService;
    private final MediaRepository mediaRepository;
    private static final Tika tika = new Tika();

    public MediaService(MinioService minioService,
            MediaRepository mediaRepository
    ) {
        this.minioService = minioService;
        this.mediaRepository = mediaRepository;
    }

    public ResponseAddMediaEntity addMediaEntity(MultipartFile file, String sellerId) {
        if (file == null || file.isEmpty()) {
            throw new EmptyMediaFileException("File is required and cannot be empty.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidMediaTypeException("Invalid file type. Only image/* is allowed.");
        }

        String detectedType = "";
        
        try {
            detectedType = tika.detect(file.getInputStream());

        } catch (Exception ex) {
            throw new InvalidMediaTypeException("InValid file type. Stream can not be read");
        }

        if (!detectedType.startsWith("image/")) {
            throw new InvalidMediaTypeException("Invalid file type. Only image/* is allowed.");
        }

        String url;
        try {
            url = minioService.uploadFile(file);
        } catch (Exception ex) {
            throw new MediaStorageException("Failed to upload file to storage.", ex);
        }

        String objectName = url.substring(url.lastIndexOf("/") + 1);

        Media media = new Media();
        media.setUrl(url);
        media.setBucketName(minioService.getBucketName());
        media.setObjectName(objectName);
        media.setContentType(contentType);
        media.setFileName(file.getOriginalFilename());
        media.setSellerId(sellerId);
        media.setAddedAt(new Date());
        try {
            mediaRepository.save(media);
        } catch (RuntimeException ex) {
            throw new MediaPersistenceException("Failed to save media metadata.", ex);
        }

        return new ResponseAddMediaEntity(
                media.getId(),
                media.getFileName(),
                contentType,
                media.getAddedAt().toString()
        );
    }
}
