import type { Request, Response, NextFunction } from 'express';

import ApiError from '../errors/ApiError';

// Assuming AppError is your custom error class
const parseBodyData = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && req.body.bodyData) {
    try {
      req.body.bodyData = JSON.parse(req.body.bodyData);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return next(new ApiError(400, 'Invalid JSON format in bodyData'));
    }
  }
  next();
};

export default parseBodyData;
