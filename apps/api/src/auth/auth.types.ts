import type { Role } from '../generated/prisma/client.js';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
