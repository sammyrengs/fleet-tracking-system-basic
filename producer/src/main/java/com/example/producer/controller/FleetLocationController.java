package com.example.producer.controller;

import com.example.producer.service.FleetLocationService;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.maps.internal.PolylineEncoding;
import com.google.maps.model.LatLng;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.example.producer.service.FleetLocationService;

@RestController
@RequestMapping("/location")
@CrossOrigin(origins = "http://localhost:3000")
public class FleetLocationController {

    @Autowired
    private FleetLocationService fleetLocationService;

    private static final String API_KEY =  "AIzaSyAwAo8nqjCmC663Ws-zHoCzHiVLGb237G0";
    private static final String ORIGIN = "12.9784,77.6408";
    private static final String DESTINATION = "12.9308,77.5839";
    private static final String WAYPOINTS = "";
    private static final String MODE = "Driving";

    @GetMapping
    public ResponseEntity<Map<String, String>> getCurrentLocation() {
        String location = fleetLocationService.getLastKnownLocation();
        return new ResponseEntity<>(Map.of("location", location), HttpStatus.OK);
    }

    @PutMapping
    public ResponseEntity updateLocation() throws InterruptedException, IOException {
        List<LatLng> coordinates = getRouteCoordinates();

        if (coordinates != null) {
            for (LatLng coord : coordinates) {
                String location = coord.lat + "," + coord.lng;
                fleetLocationService.updateLocation(location);
                Thread.sleep(1000); // Adjust delay as needed
            }
            return new ResponseEntity<>(Map.of("message", "Location Updated"), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(Map.of("message", "Error getting route"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private List<LatLng> getRouteCoordinates() throws IOException {
        String url = String.format("https://maps.googleapis.com/maps/api/directions/json?origin=%s&destination=%s&waypoints=%s&mode=%s&key=%s",
                ORIGIN, DESTINATION, WAYPOINTS, MODE, API_KEY);

        HttpClient client = HttpClientBuilder.create().build();
        HttpGet request = new HttpGet(url);
        HttpResponse response = client.execute(request);

        String jsonResponse = EntityUtils.toString(response.getEntity());

        Gson gson = new Gson();
        JsonObject data = gson.fromJson(jsonResponse, JsonObject.class);

        if (data.get("status").getAsString().equals("OK")) {
            JsonArray routes = data.getAsJsonArray("routes");
            if (routes.size() > 0) {
                JsonObject route = routes.get(0).getAsJsonObject();
                JsonArray legs = route.getAsJsonArray("legs");
                List<LatLng> coordinates = new ArrayList<>();

                for (int i = 0; i < legs.size(); i++) {
                    JsonObject leg = legs.get(i).getAsJsonObject();
                    JsonArray steps = leg.getAsJsonArray("steps");
                    for (int j = 0; j < steps.size(); j++) {
                        JsonObject step = steps.get(j).getAsJsonObject();
                        String polyline = step.getAsJsonObject("polyline").get("points").getAsString();
                        coordinates.addAll(PolylineDecoder.decode(polyline));
                    }
                }
                return coordinates;
            }
        } else {
            System.err.println("Error: " + data.get("status").getAsString());
            if (data.has("error_message")) {
                System.err.println("Error Message: " + data.get("error_message").getAsString());
            }
        }
        return null;
    }

    public static class PolylineDecoder {
        public static List<LatLng> decode(String encoded) {
            return PolylineEncoding.decode(encoded);
        }
    }


}
