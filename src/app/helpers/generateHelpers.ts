import crypto from 'crypto';

// Generate OTP
const generateOTP = (expiry: number = 10): { otp: string; expiresAt: Date } => {
  const otp = crypto.randomInt(100000, 999999).toString(); // Example: '123456'
  const expiresAt = new Date(Date.now() + expiry * 60 * 1000); // 10 minutes
  return {
    otp,
    expiresAt,
  };
};

// Generate String
const generateString = (length: number = 8): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let string = '';
  for (let i = 0; i < length; i++) {
    string += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return string;
};

// Generate Random Number
const generateRandomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const generateHelpers = {
  generateOTP,
  generateString,
  generateRandomNumber,
};
