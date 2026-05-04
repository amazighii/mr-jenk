package com.buy01.product.kafka.consumer_example;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.buy01.product.kafka.KafkaProducerConfig;
import com.buy01.product.kafka.ProductEvent;

@Service
public class DebugConsumer {

    @KafkaListener(topics = KafkaProducerConfig.PRODUCT_TOPIC, groupId =
    "debug-group")
    public void debug(ProductEvent event) {
        System.out.println("\n-----\nDEBUG RECEIVED:   \n" + event + "\n-----\n");
    }
}