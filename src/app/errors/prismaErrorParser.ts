/* eslint-disable no-useless-escape */

import type { PrismaClientValidationError } from '@prisma/client/runtime/library';

const handlePrismaValidationError = (err: PrismaClientValidationError) => {
  let field: string | null = null;
  let expectedType: string | null = null;
  let providedType: string | null = null;
  let friendlyMessage = 'Validation error in Prisma operation';

  const message = err.message;

  // 1️⃣ Type mismatch: Expected + Provided
  let match = message.match(/Argument `(.*?)`[\s\S]*Expected ([^,]+), provided (.*)\./);

  if (match) {
    field = match[1].trim();
    expectedType = match[2].trim();
    providedType = match[3].trim();
    friendlyMessage = `Invalid value for field "${field}". Expected type: ${expectedType}. Provided type: ${providedType}`;
  } else {
    // 2️⃣ Expected only (enum, date, etc.)
    match = message.match(/Invalid value for argument `(.*?)`[\s\S]*Expected ([^\.\n]*)/);
    if (match) {
      field = match[1].trim();
      expectedType = match[2].trim();
      if (expectedType.includes('Enum')) {
        friendlyMessage = `Invalid value for enum field "${field}". Expected one of: ${expectedType}`;
      } else {
        friendlyMessage = `Invalid value for field "${field}". Expected type: ${expectedType}.`;
      }
    } else {
      // 3️⃣ Missing field
      match = message.match(/Argument `(.*?)` is missing/);
      if (match) {
        field = match[1].trim();
        friendlyMessage = `Required field "${field}" is missing.`;
      }
    }
  }

  return {
    statusCode: 400,
    message: friendlyMessage,
    errorDetails: { field, expectedType, providedType, rawMessage: message },
  };
};

export default handlePrismaValidationError;
