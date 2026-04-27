package com.buy01.media.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.buy01.media.models.Media;

public interface MediaRepository extends MongoRepository<Media, String> {
    
}
