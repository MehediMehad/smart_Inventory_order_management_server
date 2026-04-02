/*
 * Useful for getting the client's IP address.
 * Output: "127.0.0.1"
 *  ## Example Uses:
 * 1. getClientIp(req)
 * output: "127.0.0.1"
 * */

import type { Request } from 'express';

export const getClientIp = (req: Request): string =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
  req.socket.remoteAddress ||
  'unknown';
