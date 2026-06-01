import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from './catchAsync.js';

const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Assign validated data back to req to ensure type-safe request handling
    req.body = parsed.body;
    req.query = parsed.query;
    req.params = parsed.params;

    next();
  });
};

export default validateRequest;
