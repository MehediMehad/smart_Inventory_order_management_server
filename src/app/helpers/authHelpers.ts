// import bcrypt from 'bcrypt';

// import config from '../configs';

// // Hash password
// const hashPassword = async (password: string): Promise<string> => {
//   const saltRounds = config.auth.bcrypt_salt_rounds; // Salt rounds
//   const hashedPassword = await bcrypt.hash(password, saltRounds);
//   return hashedPassword;
// };

// // Compare password
// const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> =>
//   await bcrypt.compare(password, hashedPassword);

// export const authHelpers = {
//   hashPassword,
//   comparePassword,
// };

import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import type { SignOptions } from 'jsonwebtoken';
import { sign, verify } from 'jsonwebtoken';

import config from '../../configs';
import ApiError from '../errors/ApiError';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets are not defined in environment variables');
}

export interface TAccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  userId: string;
}

const createAccessToken = (payload: TAccessTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    algorithm: 'HS256',
  };

  return sign(payload, JWT_ACCESS_SECRET, options);
};

const createRefreshToken = (payload: RefreshTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    algorithm: 'HS256',
  };

  return sign(payload, JWT_REFRESH_SECRET, options);
};

const verifyAccessToken = (token: string): TAccessTokenPayload => {
  try {
    return verify(token, JWT_ACCESS_SECRET) as TAccessTokenPayload;
  } catch (error) {
    console.error('Error verifying access token:', error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired access token');
  }
};

const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired refresh token');
  }
};

// Hash password
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = config.jwt.bcrypt_salt_rounds; // Salt rounds
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

// Compare password
const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> =>
  await bcrypt.compare(password, hashedPassword);

export const authHelpers = {
  hashPassword,
  comparePassword,
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
