import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_CONFIG.secret);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_CONFIG.refreshSecret as string);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_CONFIG.secret as string) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_CONFIG.refreshSecret as string) as JwtPayload;
};
