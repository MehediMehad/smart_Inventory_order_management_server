/* eslint-disable @typescript-eslint/no-namespace */
import type { JwtPayload } from 'jsonwebtoken';

import type { TAccessTokenPayload } from '../helpers/authHelpers';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & TAccessTokenPayload;
    }
    interface ProcessEnv {
      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;
      JWT_ACCESS_EXPIRES_IN: string;
      JWT_REFRESH_EXPIRES_IN: string;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
