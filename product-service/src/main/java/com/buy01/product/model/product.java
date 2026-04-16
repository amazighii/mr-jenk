package com.buy01.product.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Document(collection = "products")
@NoArgsConstructor
public class product {
    @Id
    private String id;
    private String name;
    private String description;
    private double price;
    private int quantity;
    // To check later with Media
    // private String imageUrl; // set later via Media Service 
    private String userId; // reference to User ID of the seller
}
