import type { Express } from 'express';
import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';

const file = fs.readFileSync(path.resolve('twitter-swagger.yaml'), 'utf8');
const swaggerDocument = yaml.parse(file);

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Làm giàu cùng thầy Quân',
      version: '1.0.0'
    }
    // components: {
    //   securitySchemes: {
    //     BearerAuth: {
    //       type: 'http',
    //       scheme: 'bearer',
    //       bearerFormat: 'JWT'
    //     }
    //   }
    // }
  },
  apis: ['./src/routes/*.routes.ts', './src/models/schemas/*.schema.ts'] // files containing annotations as above
};

const openaiSpecification = swaggerJsdoc(options);

export const initSwagger = (app: Express) => {
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openaiSpecification));
};
