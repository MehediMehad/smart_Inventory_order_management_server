// import type { JwtPayload, Secret } from 'jsonwebtoken';
// import jwt from 'jsonwebtoken';

// export type TAuthPayload = JwtPayload & {
//   id: string;
//   email: string;
//   role: string;
//   language?: string;
// };

// const generateToken = (payload: TAuthPayload, secret: Secret, expiresIn: string | number) => {
//   const token = jwt.sign(payload, secret, {
//     expiresIn,
//     algorithm: 'HS256',
//   });

//   return token;
// };

// const verifyToken = (token: string, secret: Secret) => jwt.verify(token, secret) as JwtPayload;

// export const jwtHelpers = {
//   generateToken,
//   verifyToken,
// };
