package com.buy01.media.repositories;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.buy01.media.models.Media;

public interface MediaRepository extends MongoRepository<Media, String> {

    void deleteByUrl(String url);

    Optional<ArrayList<Media>> findAllByProductId(String productId);

    Optional<Media> findByUrl(String url);

    // Optional<Media> findByUrlAndSellerId(String url, String sellerId);
}
