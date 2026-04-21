package com.buy01.product.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaProducerConfig {

    public static final String PRODUCT_TOPIC = "product-events";

    @Bean
    public NewTopic productTopic() {
        return TopicBuilder.name(PRODUCT_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}