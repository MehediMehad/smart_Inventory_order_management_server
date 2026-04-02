import type { UserRoleEnum } from '@prisma/client';
import { UserStatusEnum } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import type { JwtPayload } from 'jsonwebtoken';

import ApiError from '../errors/ApiError';
// import type { TAuthPayload } from '../helpers/jwtHelpers';
// import { jwtHelpers } from '../helpers/jwtHelpers';
import type { TAccessTokenPayload } from '../helpers/authHelpers';
import { authHelpers } from '../helpers/authHelpers';
import prisma from '../libs/prisma';

const auth =
  (...roles: UserRoleEnum[]) =>
  async (req: Request & { user?: TAccessTokenPayload }, _res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      const verifiedUser = authHelpers.verifyAccessToken(token);

      if (!verifiedUser?.email) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }
      const { userId } = verifiedUser;

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
      }

      if (user.status === UserStatusEnum.BLOCKED) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Your account is blocked!');
      }

      if (user.status === UserStatusEnum.DEACTIVATE) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Your account is not Activate!');
      }

      // if (user.isDeleted) {
      //   throw new ApiError(httpStatus.FORBIDDEN, 'Your account is deleted!');
      // }

      req.user = verifiedUser as JwtPayload & TAccessTokenPayload;

      if (roles.length && !roles.includes(user.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }

      next();
    } catch (err) {
      next(err);
    }
  };

export default auth;
