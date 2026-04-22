package com.buy01.product.service;

import com.buy01.product.dto.ProductRequest;
import com.buy01.product.dto.ProductResponse;
import com.buy01.product.kafka.KafkaProducerConfig;
import com.buy01.product.kafka.ProductEvent;
import com.buy01.product.model.EventType;
import com.buy01.product.model.Product;
import com.buy01.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final KafkaTemplate<String, ProductEvent> kafkaTemplate;

    // ── Public ──────────────────────────────────────────────

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toResponse(product);
    }

    // ── Seller only ─────────────────────────────────────────

    public ProductResponse createProduct(ProductRequest request, String sellerId) {
        Product product = new Product();
        product.setSellerId(sellerId);
        applyRequest(product, request);

        Product saved = productRepository.save(product);

        kafkaTemplate.send(KafkaProducerConfig.PRODUCT_TOPIC,
                new ProductEvent("PRODUCT_CREATED", saved.getId(), sellerId, saved.getName()));

        return toResponse(saved);
    }

    public ProductResponse updateProduct(String id, ProductRequest request, String sellerId) {
        Product product = productRepository.findByIdAndSellerId(id, sellerId)
                .orElseThrow(() -> new RuntimeException("Product not found or access denied"));

        applyRequest(product, request);
        Product saved = productRepository.save(product);

        kafkaTemplate.send(KafkaProducerConfig.PRODUCT_TOPIC,
                new ProductEvent("PRODUCT_UPDATED", saved.getId(), sellerId, saved.getName()));

        return toResponse(saved);
    }

    public void deleteProduct(String id, String sellerId) {
        Product product = productRepository.findByIdAndSellerId(id, sellerId)
                .orElseThrow(() -> new RuntimeException("Product not found or access denied"));

        productRepository.delete(product);

        kafkaTemplate.send(KafkaProducerConfig.PRODUCT_TOPIC,
                new ProductEvent("PRODUCT_DELETED", id, sellerId, product.getName()));
    }

    // ── Helpers ─────────────────────────────────────────────

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        if (request.getImageUrls() != null) {
            product.setImageUrls(request.getImageUrls());
        }
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setQuantity(product.getQuantity());
        response.setSellerId(product.getSellerId());
        response.setImageUrls(product.getImageUrls());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }
}