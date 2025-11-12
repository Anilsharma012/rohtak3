import type { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const response: any = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};
