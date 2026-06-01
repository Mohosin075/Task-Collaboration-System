import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler.js';
import router from './app/routes/index.js';

const app: Application = express();

// Standard middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Application routes
app.use('/api/v1', router);

// Default test route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Smart Project & Task Collaboration System API!',
  });
});

// Not Found Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.originalUrl}`,
    errorSources: [],
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
