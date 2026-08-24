import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from './api-error';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `No route for ${req.method} ${req.path}`,
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Request data failed validation',
      issues: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.code, message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
  });
}
