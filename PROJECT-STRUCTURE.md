# Project Structure

This project has been reorganized to remove redundant folders and ensure a clean structure.

## Main Folders

- client/ - Frontend React application
  - client/src/ - React source code
  - client/public/ - Static assets

- server/ - Backend Express application
  - server/src/ - Express source code
    - server/src/controllers/ - API controllers
    - server/src/middleware/ - Express middleware
    - server/src/models/ - MongoDB models
    - server/src/routes/ - API routes
    - server/src/utils/ - Utility functions
    - server/src/server.js - Main server file

## Running the Application

- Start the server: 
pm run server
- Start the client: 
pm run client
- Start both: 
pm run dev:all
- Seed the database: 
pm run seed

## Environment Variables

Make sure to set up your environment variables in the .env file in the root directory.
Required variables:
- MONGO_URI - MongoDB connection string
- REDIS_URL - Redis connection string (if using Redis)
- JWT_SECRET - Secret for JWT tokens
