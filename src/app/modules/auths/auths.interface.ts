import type { z } from 'zod';

import type {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifySchema,
  resendOtpSchema,
} from './auths.validation';

export type TRegisterPayload = z.infer<typeof registerSchema>;
export type TLoginPayload = z.infer<typeof loginSchema>;
export type TForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;
export type TResetPasswordPayload = z.infer<typeof resetPasswordSchema>;
export type TChangePasswordPayload = z.infer<typeof changePasswordSchema>;
export type TVerifyPayload = z.infer<typeof verifySchema>;
export type TResendOtpPayload = z.infer<typeof resendOtpSchema>;
