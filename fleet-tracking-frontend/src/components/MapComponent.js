import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, LoadScript, Polyline } from '@react-google-maps/api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import vehicleIcon from "../assets/vehicle-icon.png"; 

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '20px auto',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
    },
    header: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
    },
    title: {
        margin: '0 0 10px 0',
        color: '#1a73e8',
        fontSize: '24px',
        fontWeight: '500'
    },
    mapContainer: {
        width: '100%',
        height: '500px',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    controlPanel: {
        display: 'flex',
        gap: '20px',
        marginTop: '20px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    button: {
        padding: '12px 24px',
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 0.2s'
    },
    stats: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
    },
    statCard: {
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
    },
    statLabel: {
        color: '#6c757d',
        fontSize: '14px',
        marginBottom: '5px'
    },
    statValue: {
        color: '#212529',
        fontSize: '18px',
        fontWeight: '500'
    },
    connectionStatus: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px'
    },
    statusDot: (isConnected) => ({
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: isConnected ? '#2ecc71' : '#e74c3c'
    })
};

const containerStyle = {
    width: '100%',
    height: '400px'
};

const center = {
    lat: 12.9716,
    lng: 77.5946
};

const MapComponent = () => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [pathCoordinates, setPathCoordinates] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [journeyStarted, setJourneyStarted] = useState(false);
    const stompClientRef = useRef(null);
    const mapRef = useRef(null);


    useEffect(() => {
        console.log("setting up websocket connection to consumer");
        const socket = new SockJS('http://localhost:8081/fleet-location-updates');
        
        socket.onopen = () => {
            console.log('🟢 SockJS Connection Opened');
            setIsConnected(true);
        };
        
        socket.onclose = () => {
            console.log('🔴 SockJS Connection Closed');
            setIsConnected(false);
        };
        
        socket.onerror = (error) => {
            console.error('🔴 SockJS Error:', error);
            setIsConnected(false);
        };

        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 1000,
            debug: (str) => console.log('STOM Debug: ', str), 
            onConnect: () => {
                console.log('STOM Connected - Subscribing to topics...');
                setIsConnected(true);
                stompClient.subscribe('/topic/location', (response) => {
                    console.log("Received response from consumer: ", response);
                    if (response && response.body) { 
                        try {
                            // Split the comma-separated coordinates
                            const [lat, lng] = response.body.split(',').map(coord => parseFloat(coord));
                            console.log("Split coordinates - lat:", lat, "lng:", lng);
                            
                            // Create a proper LatLng object
                            const position = {
                                lat: lat,
                                lng: lng
                            };
                            
                            console.log("Setting position to:", position);
                            setCurrentLocation(position);
                            
                            // Add the new position to the path
                            setPathCoordinates(prevPath => [...prevPath, position]);
                            
                            if (mapRef.current) {
                                mapRef.current.panTo(position);
                            }
                        } catch (error) {
                            console.error("Error parsing location data:", error);
                            console.error("Raw response body:", response.body);
                        }
                    } else {
                        console.log("No response body received.");
                    }
                });
            },
            onDisconnect: () => {
                console.log('🔴 STOMP Disconnected');
                setIsConnected(false);
                setIsTracking(false);
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
                setIsConnected(false);
                setIsTracking(false);
            },
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            if (stompClient.current && stompClient.connected) {
                setIsConnected(false);
                setIsTracking(false);
                stompClient.deactivate();
            }
        };
    }, []);

    const sendMessage = () => {
        // Prevent any action if already tracking
        if (isTracking) {
            console.log('Already tracking, cannot start new journey');
            return;
        }
    
        if (!stompClientRef.current) {
            console.error('STOMP client not initialized');
            return;
        }
    
        if (!stompClientRef.current.connected) {
            console.error('STOMP client not connected');
            setIsConnected(false);
            return;
        }
    
        console.log('Starting tracking...');
        
        // Reset tracking data when starting new session
        setCurrentLocation(null);
        setPathCoordinates([]);
        
        // Send PUT request to start location updates
        fetch('http://localhost:8082/location', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to start location updates');
            }
            console.log('Successfully started location updates');
            
            setIsTracking(true);
            
            const request = {
                type: 'LOCATION_REQUEST',
                timestamp: new Date().toISOString(),
                reset: true
            };
            stompClientRef.current.publish({
                destination: '/app/location',
                body: JSON.stringify(request)
            });
        })
        .catch(error => {
            console.error('Error starting location updates:', error);
            setIsTracking(false);
        });
    };

    const onLoad = React.useCallback(function callback(map) {
        mapRef.current = map;
    }, []);

    const onUnmount = React.useCallback(function callback(map) {
        mapRef.current = null;
    }, []);

    // Polyline styling options
    const polylineOptions = {
        strokeColor: '#2196F3', // Material Blue color
        strokeOpacity: 1.0,
        strokeWeight: 2,
        geodesic: true // Makes the line follow the curve of the earth
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Fleet Tracking System</h1>
                <div style={styles.connectionStatus}>
                    <div style={styles.statusDot(isConnected)} />
                    {isConnected ? 'Connected to tracking service' : 'Disconnected'}
                </div>
            </div>

            <LoadScript googleMapsApiKey=API_KEY>
                <GoogleMap
                    mapContainerStyle={styles.mapContainer}
                    center={currentLocation || center}
                    zoom={20}
                    options={{
                        zoomControl: true,
                        mapTypeControl: true,
                        scaleControl: true,
                        streetViewControl: true,
                        fullscreenControl: true,
                        mapTypeId: 'roadmap'
                    }}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                >
                    {pathCoordinates.length > 0 && (
                        <Polyline
                            path={pathCoordinates}
                            options={{
                                strokeColor: '#1a73e8',
                                strokeOpacity: 1.0,
                                strokeWeight: 3,
                                geodesic: true
                            }}
                        />
                    )}

                    {currentLocation && (
                        <Marker
                            position={currentLocation}
                            icon={{
                                url: vehicleIcon,
                                scaledSize: new window.google.maps.Size(32, 32),
                            }}
                        />
                    )}
                </GoogleMap>
            </LoadScript>

            <div style={styles.controlPanel}>
            <button 
                onClick={sendMessage}
                style={{
                    ...styles.button,
                    backgroundColor: isTracking ? '#666666' : '#1a73e8',
                    opacity: (!isConnected || isTracking) ? 0.6 : 1,
                    cursor: (!isConnected || isTracking) ? 'not-allowed' : 'pointer'
                }}
                disabled={!isConnected || isTracking}
            >
                {isTracking ? (
                    <>
                        <span style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            animation: 'pulse 1s infinite'
                        }} />
                        Tracking in Progress
                    </>
                ) : 'Start Journey'}
            </button>

                <div style={styles.stats}>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Current Location</div>
                        <div style={styles.statValue}>
                            {currentLocation 
                                ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`
                                : 'No data'
                            }
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Points Tracked</div>
                        <div style={styles.statValue}>{pathCoordinates.length}</div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Tracking Status</div>
                        <div style={styles.statValue}>
                            {isTracking ? 'Active' : 'Idle'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapComponent;