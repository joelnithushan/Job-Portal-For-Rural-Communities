const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Portal API Documentation',
      version: '1.0.0',
      description: 'RESTful API for the Job Portal Backend',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
      {
        url: 'https://p01--job-portal-for-rural-communities--5y9vrpzyym7x.code.run',
        description: 'Production Server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
