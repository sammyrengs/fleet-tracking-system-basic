# Fleet Tracking System

A real-time fleet tracking system built with microservices architecture using Node.js, React, and Apache Kafka.

## System Architecture

The system consists of four main components:

1. **Producer**: Generates vehicle location data
2. **Broker**: Apache Kafka message broker for handling real-time data streams
3. **Consumer**: Processes and stores the vehicle location data
4. **Frontend**: React-based web interface for real-time tracking visualization

## Prerequisites

- Node.js (v14 or higher)
- Apache Kafka
- Docker (optional, for containerization)
- npm or yarn package manager

## Setup Instructions

### Kafka Setup
Make sure you have Apache Kafka installed and running locally. If using Docker:

```bash
# Start Zookeeper
docker run -d --name zookeeper -p 2181:2181 wurstmeister/zookeeper

# Start Kafka
docker run -d --name kafka -p 9092:9092 \
    -e KAFKA_ADVERTISED_HOST_NAME=localhost \
    -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
    --link zookeeper:zookeeper \
    wurstmeister/kafka
```

### Install Dependencies

Install dependencies for each component:

```bash
# Frontend
cd ../fleet-tracking-frontend
npm install
```

### Start the Services

Start each component in separate terminal windows:

```bash
cd producer
mvn clean package
java -jar target/fleet-tracking-producer-1.0.0.jar

# Build and Run Consumer
cd ../consumer
mvn clean package
java -jar target/fleet-tracking-consumer-1.0.0.jar

# Start Frontend
cd fleet-tracking-frontend
npm start
```

The frontend application will be available at `http://localhost:3000`

## Features

- Real-time vehicle location tracking
- Interactive map interface
- Vehicle status monitoring
- Historical route visualization
