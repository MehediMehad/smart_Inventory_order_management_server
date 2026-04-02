import { Router } from 'express';

import { AuthsControllers } from './auths.controller';
import { AuthsValidations } from './auths.validation';
import auth from '../../middlewares/auth';
import {
  forgotPasswordLimiter,
  loginLimiter,
  resendOtpLimiter,
} from '../../middlewares/rateLimiter';
import validateRequest from '../../middlewares/validateRequest';

const router = Router();


router.post(
  '/login',
  loginLimiter,
  validateRequest(AuthsValidations.loginSchema),
  AuthsControllers.loginUserIntoDB,
);

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validateRequest(AuthsValidations.forgotPasswordSchema),
  AuthsControllers.forgotPasswordIntoDB,
);

router.post(
  '/reset-password',
  validateRequest(AuthsValidations.resetPasswordSchema),
  AuthsControllers.resetPasswordIntoDB,
);

router.post('/refresh-token', AuthsControllers.refreshTokenIntoDB);

router.get('/me', auth("ADMIN"), AuthsControllers.getMyProfile);

router.post(
  '/change-password',
  auth('ADMIN',),
  validateRequest(AuthsValidations.changePasswordSchema),
  AuthsControllers.changePasswordIntoDB,
);

router.post(
  '/verify',
  validateRequest(AuthsValidations.verifySchema),
  AuthsControllers.verifyEmailIntoDB,
);

router.post(
  '/resend-otp',
  resendOtpLimiter,
  validateRequest(AuthsValidations.resendOtpSchema),
  AuthsControllers.resendOtpIntoDB,
);


export const AuthsRoutes = router;
