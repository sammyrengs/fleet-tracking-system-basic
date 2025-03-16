package com.example.consumer.controller;

import com.example.consumer.service.LocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class LocationController {

    private static final Logger logger = LoggerFactory.getLogger(LocationController.class);
    private String currentLocation = null; // Initialize as null

    @Autowired
    private LocationService locationService;

    @MessageMapping("/location")
    @SendTo("/topic/location")
    public String sendLocationUpdate(String message) {
        try {
            logger.info("LocationController: Received request for location update");
            if (currentLocation != null) {
                logger.info("Sending current location: {}", currentLocation);
                return currentLocation;
            } else {
                logger.warn("No location data available yet");
                return "{\"error\": \"No location data available yet\"}";
            }
        } catch (Exception e) {
            logger.error("Error processing location update", e);
            return "{\"error\": \"Failed to process location update\"}";
        }
    }

    // Method to update location from Kafka
    public void updateLocation(String location) {
        logger.info("Updating location from Kafka: {}", location);
        this.currentLocation = location;
    }
}