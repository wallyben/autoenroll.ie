import dotenv from 'dotenv';

dotenv.config();

export const APP_PORT = Number(process.env.PORT || 4000);
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
export const STRIPE_SECRET = process.env.STRIPE_SECRET || '';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
export const RETENTION_MODE = process.env.RETENTION_MODE || 'zero';
