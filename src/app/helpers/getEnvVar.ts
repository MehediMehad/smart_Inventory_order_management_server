import httpStatus from 'http-status';

import ApiError from '../errors/ApiError';

// Get environment variable
export const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key];

  if (!value && !fallback) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Environment variable ${key} is not set`);
  }
  return value || fallback!;
};
