package com.buy01.media.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class ProductEvent {
    private EventType eventType;
    private String productId;
    private String sellerId;
    private String productName;
    private List<String> imageUrls = new ArrayList<>();
}
