import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.issues
      .map((issue) => `${issue.path.map(String).join('.')}: ${issue.message}`)
      .join('; ');
    res.status(400).json({ error: messages || 'Validation failed', code: 'VALIDATION_ERROR' });
    return;
  }

  // Unknown errors
  if (err instanceof Error) {
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled server error');
  }

  res.status(500).json({ error: 'An unexpected error occurred.', code: 'INTERNAL_ERROR' });
}
