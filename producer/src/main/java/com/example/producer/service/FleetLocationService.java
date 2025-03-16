package com.example.producer.service;

import com.example.producer.constant.AppConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class FleetLocationService {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    private String lastKnownLocation = "12.9784, 77.6408";

    public String getLastKnownLocation() {
        return lastKnownLocation;
    }

    public void updateLocation(String location) {
        this.lastKnownLocation = location;
        kafkaTemplate.send(AppConstant.FLEET_LOCATION, location);
    }
}
