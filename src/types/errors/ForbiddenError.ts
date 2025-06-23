import { HttpError } from 'src/api/errors/HttpError';

export class ForbiddenError extends HttpError {
  constructor(message: string = 'Access forbidden', cause?: Error | unknown) {
    super(403, message, cause);
  }
}
