package com.buy01.media.models;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.mongodb.lang.NonNull;

import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "media")
@Data
@NoArgsConstructor
public class Media {

    @Id
    private String id;

    @NonNull
    private String url;

    @NonNull
    @Field("bucket_name")
    private String bucketName; // the MinIO bucket where the file lives

    @NonNull
    @Field("object_name")
    private String objectName; // the unique filename/path inside the bucket

    @NonNull
    @Field("content_type")
    private String contentType;

    @NonNull
    @Field("file_name")
    private String fileName;

    @Field("product_id")
    private String productId;

    @NonNull
    @Field("seller_id")
    private String sellerId;

    @NonNull
    @Field("added_at")
    private Date addedAt;
}
