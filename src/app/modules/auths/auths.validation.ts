import { OtpTypeEnum, UserRoleEnum } from '@prisma/client';
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(32, 'Password must be at most 32 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[@$!%*?&#]/, 'Password must contain at least one special character');

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  image: z.string().url('Image must be a valid URL'),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phone: z
    .string()
    .regex(/^(?:\+8801|01)[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number'),
  password: passwordSchema,
  role: z.nativeEnum(UserRoleEnum),
  fcmToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password is required'),
  fcmToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(4, 'Invalid or missing token'),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, 'Old password is required'),
  newPassword: passwordSchema,
});

export const verifySchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  code: z.string().length(6, 'OTP must be 6 digits'),
  type: z.nativeEnum(OtpTypeEnum).default(OtpTypeEnum.VERIFY_EMAIL),
});

export const resendOtpSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  type: z.nativeEnum(OtpTypeEnum),
});

export const AuthsValidations = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifySchema,
  resendOtpSchema,
};
