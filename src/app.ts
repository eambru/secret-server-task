import 'reflect-metadata';
import { createConnection } from 'typeorm';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Secret } from './entity/Secret';
import { secretRoutes } from './routes/secretRoutes';

const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Secret Server API',
        version: '1.0.0',
        description: 'API for storing and retrieving secrets with view and TTL limitations.',
      },
    },
    apis: ['./src/routes/*.ts'], // Az API dokumentációk helye
  });

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

createConnection({
  type: 'sqlite',
  database: 'secret.db',
  synchronize: true,
  logging: false,
  entities: [Secret],
}).then(() => {
  app.use('/v1/secret', secretRoutes);

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    console.log('Swagger UI is available at http://localhost:3000/api-docs');
  });
}).catch(error => console.log(error));