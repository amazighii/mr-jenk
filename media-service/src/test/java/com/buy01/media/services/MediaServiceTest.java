package com.buy01.media.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import com.buy01.media.dto.DeleteMediaResponse;
import com.buy01.media.dto.ResponseAddMediaEntity;
import com.buy01.media.dto.ResponseAddMediaEntityWrapper;
import com.buy01.media.dto.UpdateMediaResponse;
import com.buy01.media.exception.EmptyMediaFileException;
import com.buy01.media.exception.ForbiddenAction;
import com.buy01.media.exception.InvalidMediaTypeException;
import com.buy01.media.exception.MediaNotFound;
import com.buy01.media.exception.MediaPersistenceException;
import com.buy01.media.exception.MediaStorageException;
import com.buy01.media.models.Media;
import com.buy01.media.repositories.MediaRepository;

@ExtendWith(MockitoExtension.class)
public class MediaServiceTest {

    private static final byte[] PNG_BYTES = new byte[] {
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    };

    @Mock
    MinioService minioService;

    @Mock
    MediaRepository mediaRepository;

    @InjectMocks
    MediaService mediaService;

    @Test
    void addMediaEntity_ShouldUploadAndSaveMedia_WhenFileIsValid() throws Exception {
        // Arrange
        MultipartFile file = imageFile("product.png");
        when(minioService.uploadFile(file, "product.png")).thenReturn("http://minio/media-bucket/object-product.png");
        when(minioService.getBucketName()).thenReturn("media-bucket");
        when(mediaRepository.save(any(Media.class))).thenAnswer(invocation -> {
            Media media = invocation.getArgument(0);
            media.setId("media-1");
            return media;
        });

        // Act
        ResponseAddMediaEntityWrapper response = mediaService.addMediaEntity(new MultipartFile[] { file }, "seller-1");

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getResponse().size());

        ResponseAddMediaEntity mediaResponse = response.getResponse().get(0);
        assertEquals("media-1", mediaResponse.getId());
        assertEquals("product.png", mediaResponse.getFilename());
        assertEquals("image/png", mediaResponse.getContentType());
        assertEquals("http://minio/media-bucket/object-product.png", mediaResponse.getUrl());

        ArgumentCaptor<Media> mediaCaptor = ArgumentCaptor.forClass(Media.class);
        verify(mediaRepository).save(mediaCaptor.capture());

        Media savedMedia = mediaCaptor.getValue();
        assertEquals("seller-1", savedMedia.getSellerId());
        assertEquals("media-bucket", savedMedia.getBucketName());
        assertEquals("object-product.png", savedMedia.getObjectName());
        assertEquals("product.png", savedMedia.getFileName());
        assertEquals("image/png", savedMedia.getContentType());
    }

    @Test
    void addProfileImage_ShouldSaveMediaWithUserId_WhenFileIsValid() throws Exception {
        // Arrange
        MultipartFile file = imageFile("avatar.png");
        when(minioService.uploadFile(file, "avatar.png")).thenReturn("http://minio/media-bucket/avatar-object.png");
        when(minioService.getBucketName()).thenReturn("media-bucket");
        when(mediaRepository.save(any(Media.class))).thenAnswer(invocation -> {
            Media media = invocation.getArgument(0);
            media.setId("media-1");
            return media;
        });

        // Act
        ResponseAddMediaEntityWrapper response = mediaService.addProfileImage(file, "user-1");

        // Assert
        assertEquals(1, response.getResponse().size());

        ArgumentCaptor<Media> mediaCaptor = ArgumentCaptor.forClass(Media.class);
        verify(mediaRepository).save(mediaCaptor.capture());

        Media savedMedia = mediaCaptor.getValue();
        assertEquals("user-1", savedMedia.getSellerId());
        assertEquals("user-1", savedMedia.getUserId());
    }

    @Test
    void addMediaEntity_ShouldThrowException_WhenFileIsEmpty() throws Exception {
        // Arrange
        MultipartFile file = new MockMultipartFile("files", "empty.png", "image/png", new byte[] {});

        // Act + Assert
        assertThrows(EmptyMediaFileException.class, () -> {
            mediaService.addMediaEntity(new MultipartFile[] { file }, "seller-1");
        });

        verify(minioService, never()).uploadFile(any(), any());
        verify(mediaRepository, never()).save(any(Media.class));
    }

    @Test
    void addMediaEntity_ShouldThrowException_WhenContentTypeIsNotImage() throws Exception {
        // Arrange
        MultipartFile file = new MockMultipartFile("files", "notes.txt", "text/plain", "hello".getBytes());

        // Act + Assert
        assertThrows(InvalidMediaTypeException.class, () -> {
            mediaService.addMediaEntity(new MultipartFile[] { file }, "seller-1");
        });

        verify(minioService, never()).uploadFile(any(), any());
        verify(mediaRepository, never()).save(any(Media.class));
    }

    @Test
    void addMediaEntity_ShouldThrowException_WhenStorageFails() throws Exception {
        // Arrange
        MultipartFile file = imageFile("product.png");
        when(minioService.uploadFile(file, "product.png")).thenThrow(new RuntimeException("storage down"));

        // Act + Assert
        assertThrows(MediaStorageException.class, () -> {
            mediaService.addMediaEntity(new MultipartFile[] { file }, "seller-1");
        });

        verify(mediaRepository, never()).save(any(Media.class));
    }

    @Test
    void addMediaEntity_ShouldThrowException_WhenMetadataSaveFails() throws Exception {
        // Arrange
        MultipartFile file = imageFile("product.png");
        when(minioService.uploadFile(file, "product.png")).thenReturn("http://minio/media-bucket/object-product.png");
        when(minioService.getBucketName()).thenReturn("media-bucket");
        when(mediaRepository.save(any(Media.class))).thenThrow(new RuntimeException("database down"));

        // Act + Assert
        assertThrows(MediaPersistenceException.class, () -> {
            mediaService.addMediaEntity(new MultipartFile[] { file }, "seller-1");
        });
    }

    @Test
    void deleteSingleMedia_ShouldDeleteMediaAndStorageObject_WhenSellerOwnsMedia() throws Exception {
        // Arrange
        Media media = media("media-1", "seller-1", "http://minio/media-bucket/object-product.png");
        when(mediaRepository.findById("media-1")).thenReturn(Optional.of(media));
        doNothing().when(minioService).deleteFile("object-product.png");

        // Act
        DeleteMediaResponse response = mediaService.deleteSingleMedia("media-1", "seller-1");

        // Assert
        assertNotNull(response);
        assertEquals("Media deleted successfully", response.getMessage());
        verify(mediaRepository).delete(media);
        verify(minioService).deleteFile("object-product.png");
    }

    @Test
    void deleteSingleMedia_ShouldThrowException_WhenMediaDoesNotExist() {
        // Arrange
        when(mediaRepository.findById("missing-media")).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(MediaNotFound.class, () -> {
            mediaService.deleteSingleMedia("missing-media", "seller-1");
        });
    }

    @Test
    void deleteSingleMedia_ShouldThrowException_WhenSellerDoesNotOwnMedia() throws Exception {
        // Arrange
        Media media = media("media-1", "seller-1", "http://minio/media-bucket/object-product.png");
        when(mediaRepository.findById("media-1")).thenReturn(Optional.of(media));

        // Act + Assert
        assertThrows(ForbiddenAction.class, () -> {
            mediaService.deleteSingleMedia("media-1", "seller-2");
        });

        verify(mediaRepository, never()).delete(any(Media.class));
        verify(minioService, never()).deleteFile(any());
    }

    @Test
    void updateMedia_ShouldAddNewMediaAndDeleteOldMedia_WhenSellerOwnsOldMedia() throws Exception {
        // Arrange
        MultipartFile newFile = imageFile("new-product.png");
        Media oldMedia = media("old-media", "seller-1", "http://minio/media-bucket/old-object.png");

        when(minioService.uploadFile(newFile, "new-product.png")).thenReturn("http://minio/media-bucket/new-object.png");
        when(minioService.getBucketName()).thenReturn("media-bucket");
        when(mediaRepository.save(any(Media.class))).thenAnswer(invocation -> {
            Media media = invocation.getArgument(0);
            media.setId("new-media");
            return media;
        });
        when(mediaRepository.findByUrl(oldMedia.getUrl())).thenReturn(Optional.of(oldMedia));

        // Act
        UpdateMediaResponse response = mediaService.updateMedia(
                new MultipartFile[] { newFile },
                new String[] { oldMedia.getUrl() },
                "seller-1",
                "product-1"
        );

        // Assert
        assertEquals("Media updated successfully", response.getMessage());
        assertEquals(1, response.getResponse().getResponse().size());
        verify(mediaRepository).deleteByUrl(oldMedia.getUrl());
        verify(minioService).deleteFile("old-object.png");
    }

    @Test
    void deleteOldOrphanMedia_ShouldDeleteOldOrphansAndReturnCount() throws Exception {
        // Arrange
        Media media = media("media-1", "seller-1", "http://minio/media-bucket/object-product.png");
        media.setObjectName("object-product.png");

        when(mediaRepository.findByProductIdIsNullAndUserIdIsNullAndAddedAtBefore(any(Date.class)))
                .thenReturn(List.of(media));

        // Act
        int deletedCount = mediaService.deleteOldOrphanMedia();

        // Assert
        assertEquals(1, deletedCount);
        verify(mediaRepository).delete(media);
        verify(minioService).deleteFile("object-product.png");
    }

    private MultipartFile imageFile(String fileName) {
        return new MockMultipartFile("files", fileName, "image/png", PNG_BYTES);
    }

    private Media media(String id, String sellerId, String url) {
        Media media = new Media();
        media.setId(id);
        media.setSellerId(sellerId);
        media.setUrl(url);
        media.setBucketName("media-bucket");
        media.setObjectName(url.substring(url.lastIndexOf("/") + 1));
        media.setContentType("image/png");
        media.setFileName("product.png");
        media.setAddedAt(new Date());
        return media;
    }
}
