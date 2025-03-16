package com.example.producer.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

import com.example.producer.constant.AppConstant;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic shuttleFleetTopic() {
        return TopicBuilder.name(AppConstant.FLEET_LOCATION).build();
    }
}
