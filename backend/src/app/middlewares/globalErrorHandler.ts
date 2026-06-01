import { ErrorRequestHandler } from 'express';
import config from '../config/index.js';
import { ZodError } from 'zod';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: Array<{ path: string | number; message: string }> = [];

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorSources = err.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    }));
  } else if (err?.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorSources = Object.values(err.errors).map((val: any) => ({
      path: val.path,
      message: val.message,
    }));
  } else if (err?.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID';
    errorSources = [{ path: err.path, message: err.message }];
  } else if (err?.code === 11000) {
    statusCode = 400;
    message = 'Duplicate entry detected';
    const match = err.message.match(/"([^"]*)"/);
    const value = match ? match[1] : '';
    errorSources = [{ path: '', message: `${value} already exists!` }];
  } else if (err instanceof Error) {
    message = err.message;
    statusCode = (err as any).statusCode || 500;
    errorSources = [{ path: '', message: err.message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.node_env === 'development' ? err?.stack : undefined,
  });
};

export default globalErrorHandler;
