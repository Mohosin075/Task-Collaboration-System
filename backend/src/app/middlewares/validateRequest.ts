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
    
    // Assign validated data back to req only if they exist in parsed schema
    if (parsed.body !== undefined) {
      req.body = parsed.body;
    }
    if (parsed.query !== undefined) {
      req.query = parsed.query;
    }
    if (parsed.params !== undefined) {
      req.params = parsed.params;
    }

    next();
  });
};

export default validateRequest;
