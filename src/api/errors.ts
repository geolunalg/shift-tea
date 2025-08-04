import { Request, Response, NextFunction } from "express";

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UserNotAuthenticatedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UserForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  let message = "Something went wrong on our end";

  switch (true) {
    case err instanceof BadRequestError:
      statusCode = 400;
      message = err.message;
      break;
    case err instanceof UserNotAuthenticatedError:
      statusCode = 401;
      message = err.message;
      break;
    case err instanceof UserForbiddenError:
      statusCode = 403;
      message = err.message;
      break;
    case err instanceof NotFoundError:
      statusCode = 404;
      message = err.message;
      break;
    default:
      message = `${message}: ${err.message}`;
      break;
  }

  res.status(statusCode).json({
    error: message,
  });

  next();
}
