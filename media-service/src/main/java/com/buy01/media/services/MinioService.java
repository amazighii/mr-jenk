package com.buy01.media.services;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.errors.MinioException;

@Service
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket.name}")
    private String bucket;

    @Value("${minio.url}")
    private String minioUrl;

    public MinioService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    public String getBucketName() {
        return bucket;
    }

    public String uploadFile(MultipartFile file) throws Exception {

        boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());

        if (!bucketExists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        }

        String objectName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucket)
                        .object(objectName)
                        .stream(file.getInputStream(), file.getSize(), Long.valueOf("-1"))
                        .contentType(file.getContentType())
                        .build()
        );

        return minioUrl + "/" + bucket + "/" + objectName;
    }

    public void deleteFile(String objectName) throws MinioException {
        minioClient.removeObject(
                RemoveObjectArgs
                        .builder()
                        .object(objectName)
                        .bucket(bucket)
                        .build()
        );
    }

}
