const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dental Clinic API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Dental Clinic Management System',
      contact: {
        name: 'API Support',
        email: 'support@dentalclinic.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://api.dentalclinic.com'
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './routes/*.js',
    './models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Dental Clinic API Documentation'
  })
}; 