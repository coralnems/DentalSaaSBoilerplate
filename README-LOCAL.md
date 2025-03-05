# Running the MERN Boilerplate Application Locally

This guide provides instructions for running the entire MERN Boilerplate application locally using Docker containers for MongoDB and Redis.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Docker

## Docker Containers

The application uses the following Docker containers:

### Redis Container

```json
{
  "Id": "f0d6d31c4e8dd35e01dfbec12b4639f6cb2c4b3362404ae161d2cb184b77993c",
  "Image": "redis/redis-stack-server:latest",
  "IPAddress": "localhost",
  "Ports": {
    "6379/tcp": null
  }
}
```

### MongoDB Container

```json
{
  "Id": "fb7436baf0540929a0d5ca6f2076b9109f53b752bf82b3750d91a10300c88bb7",
  "Image": "mongodb/mongodb-community-server:5.0-ubi8",
  "IPAddress": "localhost",
  "Ports": {
    "27017/tcp": "32768"
  }
}
```

## Environment Configuration

### Server (.env)

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:32768/dental-clinic
JWT_SECRET=your-jwt-secret-key-for-development
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=secure-encryption-key-for-development

# Redis Configuration
REDIS_HOST=172.17.0.2
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://172.17.0.2:6379

# MongoDB Configuration
MONGO_HOST=localhost
MONGO_PORT=32768
MONGO_DB=dental-clinic
MONGO_USER=
MONGO_PASSWORD=
```

### Client (.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_ENCRYPTION_KEY=secure-encryption-key-for-development
VITE_REDIS_HOST=172.17.0.2
VITE_REDIS_PORT=6379
VITE_REDIS_PASSWORD=
```

## Starting the Application

### 1. Start Docker Containers

If the containers are not already running, start them:

```bash
# Start Redis container
docker run -d --name redis-stack-server -p 6379:6379 redis/redis-stack-server:latest

# Start MongoDB container
docker run -d --name mongodb -p 32768:27017 mongodb/mongodb-community-server:5.0-ubi8
```

## Automatic Docker Configuration

This application includes an automatic Docker container detection script that can configure your environment variables based on your running Docker containers.

To use this feature:

1. Make sure your Docker containers (MongoDB and Redis) are running
2. Run the configuration script:
   ```bash
   npm run docker:config
   ```

The script will:
- Automatically detect your MongoDB and Redis containers
- Update the `.env` file with the correct IP addresses and ports
- Update the client `.env` file if it exists
- Display a summary of the detected configuration

This is especially useful when container IPs change or when you're setting up the application for the first time.