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

### 1. Clone the Repository
```bash
git clone https://github.com/sammyrengs/fleet-tracking-system-basic.git
cd fleet-tracking-system-basic
```

### 2. Kafka Setup
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

### 3. Install Dependencies

Install dependencies for each component:

```bash
# Producer
cd producer
npm install

# Consumer
cd ../consumer
npm install

# Frontend
cd ../fleet-tracking-frontend
npm install
```

### 4. Configuration
Create `.env` files in each component directory if needed:

Producer `.env`:
```
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=vehicle_location
```

Consumer `.env`:
```
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=vehicle_location
```

Frontend `.env`:
```
REACT_APP_API_URL=http://localhost:3001
```

### 5. Start the Services

Start each component in separate terminal windows:

```bash
# Start Producer
cd producer
npm start

# Start Consumer
cd consumer
npm start

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
- Multiple vehicle tracking support

## Project Structure

```
fleet-tracking-system-basic/
├── producer/           # Vehicle location data generator
├── consumer/          # Data processing service
├── broker/           # Kafka configuration
└── fleet-tracking-frontend/  # React frontend application
```
