import { User, UserStatusEnum, type Prisma } from '@prisma/client';
import { compare } from 'bcrypt';
import httpStatus from 'http-status';
import type { JwtPayload } from 'jsonwebtoken';
import { verify } from 'jsonwebtoken';

import type {
  TRegisterPayload,
  TLoginPayload,
  TChangePasswordPayload,
  TForgotPasswordPayload,
  TResetPasswordPayload,
  TVerifyPayload,
  TResendOtpPayload,
} from './auths.interface';
import config from '../../../configs';
import ApiError from '../../errors/ApiError';
import { authHelpers } from '../../helpers/authHelpers';
import { generateHelpers } from '../../helpers/generateHelpers';
import prisma from '../../libs/prisma';
import { ForgotPasswordHtml } from '../../utils/email/ForgotPasswordHtml';
import { sentEmailUtility } from '../../utils/email/sendEmail.util';
import { SignUpVerificationHtml } from '../../utils/email/SignUpVerificationHtml';

type TResponse = {
  data: Partial<User>;
  message: string;
}

const registerUser = async (payload: TRegisterPayload): Promise<TResponse> => {
  // if user already exists
  const isUserExists = await prisma.user.findFirst({
    where: {
      email: payload.email,
    },
    select: {
      id: true,
      email: true,
      isVerified: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (isUserExists && isUserExists.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists');
  }

  if (isUserExists && !isUserExists.isVerified) {
    const { otp, expiresAt } = generateHelpers.generateOTP(10);

    const createOTP = await prisma.otp.create({
      data: {
        code: otp,
        email: isUserExists.email,
        type: 'VERIFY_EMAIL',
        expiresAt,
      },
    });

    // Send email in a separate thread
    void sentEmailUtility(
      isUserExists.email,
      'Verify Your Email',
      SignUpVerificationHtml('Verify Your Email', createOTP.code),
    );

    return {
      data: isUserExists,
      message: 'Please verify your email.',
    };
  }

  const hashedPassword: string = await authHelpers.hashPassword(payload.password);

  let fcmTokens: string[] = [];

  if (payload.fcmToken) {
    fcmTokens.push(payload.fcmToken);
  }

  // Create user data
  const CreateUserdata: Prisma.UserCreateInput = {
    name: payload.name,
    image: payload.image,
    email: payload.email,
    password: hashedPassword,
    role: payload.role,
    phone: payload.phone,
    isVerified: false,
    fcmTokens: fcmTokens,
    status: 'DEACTIVATE',
  };

  // transaction
  const result = await prisma.$transaction(
    async (tx) => {
      const user = await tx.user.create({
        data: CreateUserdata,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          image: true,
          isVerified: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      const { otp, expiresAt } = generateHelpers.generateOTP(10);

      const createOTP = await tx.otp.create({
        data: {
          code: otp,
          email: user.email,
          type: 'VERIFY_EMAIL',
          expiresAt,
        },
      });

      // Send email in a separate thread
      void sentEmailUtility(
        user.email,
        'Verify Your Email',
        SignUpVerificationHtml('Verify Your Email', createOTP.code),
      );


      return user;
    },
    {
      timeout: 10000, // 10 seconds
    },
  );

  return {
    data: result,
    message: 'User registered successfully. Please check your email to verify.',
  };
};

const loginUser = async (payload: TLoginPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  if (!user.isVerified) throw new ApiError(httpStatus.FORBIDDEN, 'Please verify your email first');

  if (user.status !== 'ACTIVE')
    throw new ApiError(httpStatus.FORBIDDEN, `Account is ${user.status.toLowerCase()}`);

  const isPasswordMatch = await compare(payload.password, user.password);

  if (!isPasswordMatch) throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid password');


  const accessToken = authHelpers.createAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  const refreshToken = authHelpers.createRefreshToken({
    userId: user.id,
  });

  // password should not be sent
  const { password: _, ...userData } = user;

  return {
    accessToken,
    refreshToken,
    ...userData,
  };
};

const verifyEmail = async (payload: TVerifyPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true, name: true, email: true, role: true, isVerified: true },
  });

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const otpRecord = await prisma.otp.findFirst({
    where: {
      email: payload.email,
      code: payload.code,
      type: payload.type,
      expiresAt: { gt: new Date() }, // not expired OTP
    },
    orderBy: { createdAt: 'desc' }, // newest OTP
    select: { id: true },
  });

  if (!otpRecord)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired verification code');

  const accessToken = authHelpers.createAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  const refreshToken = authHelpers.createRefreshToken({
    userId: user.id,
  });

  // Transaction usage
  const updatedUser = await prisma.$transaction(
    async (tx) => {
      // 1. Verify email
      const user = await tx.user.update({
        where: { email: payload.email },
        data: { isVerified: true, status: UserStatusEnum.ACTIVE },
        select: { id: true, name: true, email: true, role: true, isVerified: true },
      });

      // 2. Delete all OTPs from this email (security + cleanup)
      await tx.otp.deleteMany({
        where: {
          OR: [{ email: payload.email, type: payload.type }, { expiresAt: { lte: new Date() } }],
        },
      });

      // 3. Create RESET_PASSWORD OTP
      if (payload.type === 'RESET_PASSWORD') {
        const { expiresAt } = generateHelpers.generateOTP(10);
        await tx.otp.create({
          data: {
            code: accessToken,
            email: payload.email,
            type: 'RESET_PASSWORD',
            expiresAt, // 10 minutes
          },
        });
      }

      return user;
    },
    {
      timeout: 10000, // 10 seconds
    },
  );

  return {
    message: `${payload.type.toLowerCase()} verified successfully`,
    result: {
      ...updatedUser,
      accessToken,
      refreshToken,
    },
  };
};

const forgotPassword = async (payload: TForgotPasswordPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  // if (!user) {
  //   // "User not found" is usually not called for security reasons
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'If email exists, reset link will be sent');
  // }

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const { otp, expiresAt } = generateHelpers.generateOTP(10); // 10 minutes

  await prisma.otp.create({
    data: {
      email: payload.email,
      code: otp,
      type: 'RESET_PASSWORD',
      expiresAt,
    },
  });

  // async email send
  void sentEmailUtility(
    payload.email,
    'Reset Your Password',
    ForgotPasswordHtml('Reset Password', otp),
  );

  return {
    message: 'Reset password code has been sent to your email',
  };
};

const resetPassword = async (payload: TResetPasswordPayload) => {
  const otpRecord = await prisma.otp.findFirst({
    where: {
      code: payload.token,
      type: 'RESET_PASSWORD',
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired token');
  }

  const hashedPassword = await authHelpers.hashPassword(payload.newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { email: otpRecord.email },
      data: { password: hashedPassword },
    });

    // Delete all RESET_PASSWORD OTPs from this email
    await tx.otp.deleteMany({
      where: {
        email: otpRecord.email,
        type: 'RESET_PASSWORD',
      },
    });
  });

  return { message: 'Password reset successful' };
};

const changePassword = async (userId: string, payload: TChangePasswordPayload) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const isMatch = await compare(payload.oldPassword, user.password);

  if (!isMatch) throw new ApiError(httpStatus.BAD_REQUEST, 'Old password is incorrect');

  const newHashedPassword = await authHelpers.hashPassword(payload.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: newHashedPassword },
  });

  return { message: 'Password changed successfully' };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      image: true,
      isVerified: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  return user;
};

const refreshToken = async (refreshToken: string) => {
  // Verify
  const decoded = verify(refreshToken, config.jwt.refresh_secret) as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');

  const newAccessToken = authHelpers.createAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  return { accessToken: newAccessToken };
};

const resendOtp = async (payload: TResendOtpPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  // if (!user) {
  //   // Security: user না থাকলেও success message দাও (enumeration prevent)
  //   return { message: 'If the email exists, a new OTP has been sent.' };
  // }

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const { otp, expiresAt } = generateHelpers.generateOTP(10);

  await prisma.otp.create({
    data: {
      code: otp,
      email: payload.email,
      type: payload.type,
      expiresAt,
    },
  });

  // async email send
  const html =
    payload.type === 'VERIFY_EMAIL'
      ? SignUpVerificationHtml('Verify Your Email', otp)
      : ForgotPasswordHtml('Reset Your Password', otp);

  void sentEmailUtility(payload.email, 'Your Verification Code', html);

  return { message: 'A new OTP has been sent to your email.' };
};

export const AuthsServices = {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  refreshToken,
  resendOtp,
};
