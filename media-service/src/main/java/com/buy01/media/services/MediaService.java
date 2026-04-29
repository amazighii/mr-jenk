package com.buy01.media.services;

import java.util.ArrayList;
import java.util.Date;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.buy01.media.dto.DeleteMediaResponse;
import com.buy01.media.dto.ResponseAddMediaEntity;
import com.buy01.media.dto.ResponseAddMediaEntityWrapper;
import com.buy01.media.exception.EmptyMediaFileException;
import com.buy01.media.exception.ForbiddenAction;
import com.buy01.media.exception.InvalidMediaTypeException;
import com.buy01.media.exception.MediaNotFound;
import com.buy01.media.exception.MediaPersistenceException;
import com.buy01.media.exception.MediaStorageException;
import com.buy01.media.models.Media;
import com.buy01.media.repositories.MediaRepository;

import io.minio.errors.MinioException;

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

    public ResponseAddMediaEntityWrapper addMediaEntity(MultipartFile[] files, String sellerId) {
        ResponseAddMediaEntityWrapper responseAddMediaEntityWrapper = new ResponseAddMediaEntityWrapper();
        ArrayList<ResponseAddMediaEntity> response = new ArrayList<>();

        for (MultipartFile file : files) {
            ResponseAddMediaEntity responseAddMediaEntity = validateMedia(file, sellerId);
            response.add(responseAddMediaEntity);
        }

        responseAddMediaEntityWrapper.setResponse(response);

        return responseAddMediaEntityWrapper;

    }

    private ResponseAddMediaEntity validateMedia(MultipartFile file, String sellerId) {
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
                media.getUrl(),
                media.getAddedAt().toString()
        );

    }

    public DeleteMediaResponse deleteSingleMedia(String mediaId, String sellerId) {
        System.out.println("mediaId: " + mediaId + "  sellerId: " + sellerId);

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new MediaNotFound());

        if (!media.getSellerId().equals(sellerId)) {
            throw new ForbiddenAction("Forbidden: You can not perform this action");
        }

        mediaRepository.delete(media);

        try {
            String objectName = media.getUrl().substring(media.getUrl().lastIndexOf("/") + 1);

            minioService.deleteFile(objectName);

        } catch (MinioException e) {
            throw new MediaPersistenceException("Faild to delete this media", e);
        }

        return new DeleteMediaResponse("Media deleted successfully");
    }
}
