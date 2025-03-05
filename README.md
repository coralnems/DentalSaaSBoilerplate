# Dental Clinic Management System

A comprehensive MERN stack application for managing a dental clinic, including patient records, appointments, treatments, and payments.

## Features

- User authentication and authorization (Admin, Dentist, Staff, Patient)
- Patient management
- Appointment scheduling and management
- Treatment planning and tracking
- Payment processing and invoicing
- Responsive dashboard with analytics
- Secure data handling with encryption

## Tech Stack

- **Frontend**: React, TypeScript, Material UI, Redux Toolkit, React Query
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Caching**: Redis
- **Authentication**: JWT, Refresh Tokens
- **Deployment**: Docker, CI/CD

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   ├── src/                # React source code
│   │   ├── api/            # API services
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # Business logic
│   │   ├── store/          # Redux store
│   │   ├── styles/         # Global styles
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main App component
│   │   └── main.tsx        # Entry point
│   ├── .env                # Environment variables
│   ├── package.json        # Dependencies
│   └── vite.config.ts      # Vite configuration
│
├── server/                 # Backend Express application
│   ├── src/                # Express source code
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── .env                # Environment variables
│   └── package.json        # Dependencies
│
├── .env                    # Root environment variables
├── package.json            # Root dependencies
└── deploy.sh               # Deployment script
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB
- Redis

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dental-clinic.git
   cd dental-clinic
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the root directory
   - Update the variables with your configuration

4. Start the development server:
   ```bash
   npm run dev:all
   ```

### Running with Docker

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## API Documentation

API documentation is available at `/api/docs` when the server is running.

## Testing

Run tests with:
```bash
npm test
```

## Deployment

Use the deployment script:
```bash
./deploy.sh [environment]
```

Where `[environment]` is either `production` or `staging`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Material UI](https://mui.com/)
