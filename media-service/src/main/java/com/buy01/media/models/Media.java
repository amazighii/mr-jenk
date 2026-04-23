package com.buy01.media.models;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.mongodb.lang.NonNull;

import lombok.Data;

@Document(collection = "media")
@Data
public class Media {

    @Id
    private String id;
    @NonNull
    private String url;
    @NonNull
    private String bucket_name; // the MinIO bucket where the file lives
    @NonNull
    private String object_name; // the unique filename/path inside the bucket
    @NonNull
    private String content_type;
    @NonNull
    private String file_name;
    @NonNull
    private String product_id;
    @NonNull
    private String seller_id;
    @NonNull
    private Date created_at;
}
