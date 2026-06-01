import { NextFunction, Request, Response } from 'express';
import AppError from '../errors/AppError.js';
import { jwtHelpers } from '../helpers/jwtHelper.js';
import config from '../config/index.js';
import { User } from '../modules/user/user.model.js';

// Extend Express Request interface to include user object
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: 'Admin' | 'Project Manager' | 'Team Member';
      };
    }
  }
}

const authGuard = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(401, 'You are not authorized!');
      }

      const token = authHeader.split(' ')[1];
      let decoded;
      
      try {
        decoded = jwtHelpers.verifyToken(token, config.jwt_secret) as any;
      } catch (err) {
        throw new AppError(401, 'Invalid or expired token!');
      }

      // Check if user exists in database
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AppError(404, 'User does not exist!');
      }

      if (roles.length && !roles.includes(decoded.role)) {
        throw new AppError(403, 'Forbidden! You do not have permission.');
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authGuard;
