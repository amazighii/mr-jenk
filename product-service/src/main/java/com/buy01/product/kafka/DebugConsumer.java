package com.buy01.product.kafka;

// import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class DebugConsumer {

    // @KafkaListener(topics = KafkaProducerConfig.PRODUCT_TOPIC, groupId =
    // "debug-group")
    public void debug(ProductEvent event) {
        System.out.println("\n-----\nDEBUG RECEIVED:   \n" + event + "\n-----\n");
    }
}