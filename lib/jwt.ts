import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

export function signToken(payload: object, expiresIn?: string): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn || '30d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
