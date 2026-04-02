import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: { success: false, message: 'Too many login attempts. Try again after 15 minutes.' },
  keyGenerator: (req) => req.body.email?.toLowerCase().trim() || req?.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: { success: false, message: 'Too many password reset requests. Try again later.' },
  keyGenerator: (req) => req.body.email?.toLowerCase().trim() || req?.ip,
});

const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many OTP resend requests. Please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  keyGenerator: (req) =>
    // It is better to limit by email (IP + email combo is more secure)
    req.body.email?.toLowerCase().trim() || req?.ip,
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
});

export { loginLimiter, forgotPasswordLimiter, resendOtpLimiter };
