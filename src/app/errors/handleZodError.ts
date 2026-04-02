import type { ZodError, ZodIssue } from 'zod';

import type { TErrorDetails, TGenericErrorResponse } from '../interface/error';

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  let message = '';
  const errorDetails: TErrorDetails = {
    issues: err.issues.map((issue: ZodIssue) => {
      const path = issue.path[issue.path.length - 1];

      // Optional: handle non-string/number paths
      const parsedPath = typeof path === 'string' || typeof path === 'number' ? path : 'unknown';

      message +=
        issue.message === 'Expected number, received string'
          ? `${parsedPath} ${issue.message}`
          : `. ${issue.message}`;

      return {
        path: parsedPath,
        message: issue.message,
      };
    }),
  };

  return {
    statusCode: 400,
    message,
    errorDetails,
  };
};

export default handleZodError;
