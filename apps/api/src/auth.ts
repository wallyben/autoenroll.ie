import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config';

interface MagicLinkRequest {
  email: string;
  organisationId?: string;
}

const codeStore = new Map<string, { code: string; expiresAt: number; organisationId: string }>();

export function requestMagicLink({ email, organisationId = 'demo-org' }: MagicLinkRequest) {
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  codeStore.set(email, { code, expiresAt, organisationId });
  return { code, expiresAt };
}

export function verifyMagicLink(email: string, code: string) {
  const entry = codeStore.get(email);
  if (!entry || entry.code !== code || entry.expiresAt < Date.now()) {
    throw new Error('Invalid or expired code');
  }
  codeStore.delete(email);
  const token = jwt.sign({ email, organisationId: entry.organisationId }, JWT_SECRET, {
    expiresIn: '4h'
  });
  return token;
}

export function verifyToken(token?: string) {
  if (!token) throw new Error('Missing token');
  return jwt.verify(token, JWT_SECRET) as { email: string; organisationId: string };
}
