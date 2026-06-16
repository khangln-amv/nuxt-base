import { ApiErrorCode } from './errorCodes';

export type Result<T, E = Error> = [T, null] | [null, E];

export const tryResolve = async <T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> => {
  try {
    return [await promise, null];
  } catch (error) {
    return [null, error as E];
  }
};

export const tryCall = <T, E = Error>(cb: () => T): Result<T, E> => {
  try {
    return [cb(), null];
  } catch (error) {
    return [null, error as E];
  }
};

export const getApiErrorCode = (error: unknown): ApiErrorCode =>
  (error as { data?: { data?: { code?: ApiErrorCode } } })?.data?.data?.code ?? ApiErrorCode.Unknown;
