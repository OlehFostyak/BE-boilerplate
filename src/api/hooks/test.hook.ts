 
import { preHandlerAsyncHookHandler } from 'fastify';
import { HttpError } from 'src/api/errors/HttpError';

export const testHook: preHandlerAsyncHookHandler = async function (request) {
  try {
    request.log.info('test');
  } catch (err) {
    throw new HttpError(400, 'Test err', err);
  }
};