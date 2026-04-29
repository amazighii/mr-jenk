package com.buy01.media.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ForbiddenAction.class)
    public ResponseEntity<Map<String, String>> handleForbiddenAction(ForbiddenAction ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
    }


    @ExceptionHandler(MediaNotFound.class)
    public ResponseEntity<Map<String, String>> handleMediaNotFound(MediaNotFound ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Media Not found"));
    }

    @ExceptionHandler(InvalidMediaTypeException.class)
    public ResponseEntity<Map<String, String>> handleInvalidMediaType(InvalidMediaTypeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(EmptyMediaFileException.class)
    public ResponseEntity<Map<String, String>> handleEmptyMediaFile(EmptyMediaFileException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "File size exceeds the configured limit."));
    }

    @ExceptionHandler(MediaStorageException.class)
    public ResponseEntity<Map<String, String>> handleStorage(MediaStorageException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(MediaPersistenceException.class)
    public ResponseEntity<Map<String, String>> handlePersistence(MediaPersistenceException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred."));
    }
}
