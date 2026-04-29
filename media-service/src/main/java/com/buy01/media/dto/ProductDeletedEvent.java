package com.buy01.media.dto;

import java.util.List;

import lombok.Data;

@Data
public class ProductDeletedEvent {
    private String productId;
    private List<String> imageUrls;
}
