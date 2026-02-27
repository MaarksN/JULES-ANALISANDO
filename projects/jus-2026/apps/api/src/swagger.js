import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JusArtificial API',
      version: '1.0.0',
      description: 'API para a suíte jurídica JusArtificial (Chat, OCR, Documentos)',
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Servidor de Desenvolvimento',
      },
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
  apis: ['./backend/routes/*.js'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
