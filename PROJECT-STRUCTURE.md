# Project Structure

This project has been reorganized to remove redundant folders and ensure a clean structure.

## Main Folders

- client/ - Frontend React application
  - client/src/ - React source code
    - client/src/api/ - API services
    - client/src/assets/ - Images, fonts, etc.
    - client/src/components/ - Reusable components
    - client/src/contexts/ - React contexts
    - client/src/hooks/ - Custom hooks
    - client/src/pages/ - Page components
    - client/src/services/ - Business logic
    - client/src/store/ - Redux store
    - client/src/styles/ - Global styles
    - client/src/types/ - TypeScript types
    - client/src/utils/ - Utility functions
  - client/public/ - Static assets

- server/ - Backend Express application
  - server/src/ - Express source code
    - server/src/config/ - Configuration files
    - server/src/controllers/ - API controllers
    - server/src/middleware/ - Express middleware
    - server/src/models/ - MongoDB models
    - server/src/routes/ - API routes
    - server/src/services/ - Business logic
    - server/src/utils/ - Utility functions
    - server/src/server.js - Main server file

## Running the Application

- Start the server: 
```bash
npm run server
```
- Start the client: 
```bash
npm run client
```
- Start both: 
```bash
npm run dev:all
```
- Seed the database: 
```bash
npm run seed
```

## Environment Variables

Make sure to set up your environment variables in the .env file in the root directory.
Required variables:
- MONGO_URI - MongoDB connection string
- REDIS_URL - Redis connection string (if using Redis)
- JWT_SECRET - Secret for JWT tokens
- PORT - Server port (default: 5000)

## API Endpoints

The API is organized with the following endpoints:

- /api/auth - Authentication routes
- /api/users - User management
- /api/patients - Patient management
- /api/appointments - Appointment scheduling
- /api/treatments - Treatment management
- /api/payments - Payment processing
