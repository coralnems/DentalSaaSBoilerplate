# Dental Clinic Management System

A comprehensive dental clinic management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- 🦷 Patient Management
- 📅 Appointment Scheduling
- 💰 Billing and Payments (Stripe Integration)
- 📄 Invoice Generation
- 📱 SMS/Email Notifications
- 📊 Reporting and Analytics
- 🔒 Role-based Access Control
- 🏥 Insurance Verification
- 📈 Performance Monitoring
- 🔄 Automated Backups

## Prerequisites

- Node.js >= 14.0.0
- MongoDB >= 4.4
- npm >= 6.0.0

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dental-clinic-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:
```env
NODE_ENV=development
PORT=8080
MONGO_URI=mongodb://localhost:27017/dental-clinic
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET=your-s3-bucket
```

## Development

Start the development server:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Linting

Run ESLint:
```bash
npm run lint
```

Fix ESLint errors:
```bash
npm run lint:fix
```

## Documentation

Generate API documentation:
```bash
npm run docs
```

The documentation will be available at `http://localhost:8080/api-docs`.

## Monitoring

The application uses Prometheus and Grafana for monitoring. Metrics are exposed at `/metrics`.

## Backup

Run database and file backup:
```bash
npm run backup
```

## CI/CD

The project uses GitHub Actions for continuous integration and deployment. The pipeline includes:
- Automated testing
- Code linting
- Coverage reporting
- Deployment to staging/production
- Database backups

## Directory Structure

```
├── server/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # Express routes
│   ├── services/      # Business logic
│   ├── utils/         # Utility functions
│   └── scripts/       # Maintenance scripts
├── tests/
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── setup.js       # Test setup file
├── docs/             # API documentation
└── .github/
    └── workflows/    # GitHub Actions workflows
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
