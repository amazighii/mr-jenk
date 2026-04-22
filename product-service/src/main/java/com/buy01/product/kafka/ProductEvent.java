package com.buy01.product.kafka;

import com.buy01.product.model.EventType;

// import com.buy01.product.model.EventType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductEvent {
    // "PRODUCT_CREATED"
    // "PRODUCT_UPDATED"
    // "PRODUCT_DELETED"
    private EventType eventType;
    private String productId;
    private String sellerId;
    private String productName;
}