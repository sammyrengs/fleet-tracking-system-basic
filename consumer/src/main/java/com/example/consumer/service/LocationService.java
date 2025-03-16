package com.example.consumer.service;

import com.example.consumer.controller.LocationController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class LocationService {
    private static final Logger logger = LoggerFactory.getLogger(LocationService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    @Lazy
    private LocationController locationController;

    @KafkaListener(topics = "fleet-location", groupId = "user-group")
    public void fleetLocation(String location) {
        logger.info("Received location update from Kafka: {}", location);
        try {
            // Update the controller's current location
            locationController.updateLocation(location);
            // Send to all connected WebSocket clients
            messagingTemplate.convertAndSend("/topic/location", location);
            logger.info("Successfully broadcast location update to WebSocket clients");
        } catch (Exception e) {
            logger.error("Error processing location update from Kafka", e);
        }
    }
}