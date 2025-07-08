import { EErrorCodes } from './EErrorCodes';

export interface HttpErrorParams {
  statusCode: number;
  message?: string;
  cause?: Error | unknown;
  errorCode?: EErrorCodes;
}

export class HttpError extends Error {
  readonly statusCode: number;
  readonly cause?: Error | unknown;
  readonly errorCode?: EErrorCodes;

  constructor(params: HttpErrorParams) {
    super(params.message || 'Error');
    this.statusCode = params.statusCode;
    this.cause = params.cause;
    this.errorCode = params.errorCode;
  }
}