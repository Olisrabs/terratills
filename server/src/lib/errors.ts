export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFound(resource: string): AppError {
  return new AppError(404, 'NOT_FOUND', `${resource} not found.`);
}

export function forbidden(msg = 'Forbidden'): AppError {
  return new AppError(403, 'FORBIDDEN', msg);
}

export function badRequest(msg: string, code = 'BAD_REQUEST'): AppError {
  return new AppError(400, code, msg);
}

export function unauthorized(msg = 'Unauthenticated'): AppError {
  return new AppError(401, 'UNAUTHORIZED', msg);
}

export function conflict(msg: string): AppError {
  return new AppError(409, 'CONFLICT', msg);
}
