import express from 'express';
import 'reflect-metadata';
// import bodyParser from 'body-parser';
// import swaggerJsdoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';

import { mountErrorHandlers } from 'config/errorHandlers';
import { mountMiddlewares } from 'config/middlewares';
import { mountRoutes } from 'config/routes';

const app = express();

mountMiddlewares(app);
mountRoutes(app);
mountErrorHandlers(app);


export default app;
