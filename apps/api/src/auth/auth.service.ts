import { createHash, randomBytes } from 'node:crypto';

import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Prisma, Role } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from './auth.types.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import { hashPassword, verifyPassword } from './password.js';

const publicUserSelect = {
  id: true,
  email: true,
  phone: true,
  fullName: true,
  role: true,
  active: true,
  gender: true,
  birthday: true,
} satisfies Prisma.UserSelect;

type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

// ponytail: fixed lifetimes — upgrade when remember-me needed.
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_DAYS = 7;

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: input.email,
          phone: input.phone,
          fullName: input.fullName.trim(),
          passwordHash: await hashPassword(input.password),
          role: Role.PATIENT,
          gender: input.gender,
          birthday: input.birthday,
          patientProfile: { create: {} },
        },
        select: publicUserSelect,
      });
      return this.issue(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  async login(input: LoginDto) {
    const email = input.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.active || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const safeUser = await this.prisma.user.findUnique({ where: { id: user.id }, select: publicUserSelect });
    if (!safeUser) throw new UnauthorizedException('Invalid email or password');
    return this.issue(safeUser);
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token required');
    const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash: hashRefreshToken(refreshToken) } });
    if (!record || record.revokedAt || record.expiresAt <= new Date()) throw new UnauthorizedException('Invalid or expired refresh token');
    const user = await this.prisma.user.findUnique({ where: { id: record.userId }, select: publicUserSelect });
    if (!user?.active) throw new UnauthorizedException('Account is unavailable');
    await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    return this.issue(user);
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    await this.prisma.refreshToken.updateMany({ where: { tokenHash: hashRefreshToken(refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async me(actorId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: actorId }, select: publicUserSelect });
    if (!user?.active) throw new UnauthorizedException('Account is unavailable');
    return user;
  }

  async verifyToken(token: string): Promise<AuthUser & { expiresAt: number }> {
    const payload = await this.jwt.verifyAsync<{ sub: string; email: string; role: Role; exp: number }>(token);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, fullName: true, role: true, active: true },
    });
    if (!user?.active || user.email !== payload.email || user.role !== payload.role) throw new UnauthorizedException();
    if (!payload.exp) throw new UnauthorizedException();
    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role, expiresAt: payload.exp * 1000 };
  }

  private async issue(user: PublicUser) {
    const refreshToken = randomBytes(48).toString('base64url');
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({ data: { userId: user.id, tokenHash: hashRefreshToken(refreshToken), expiresAt: refreshExpiresAt } });
    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role }, { expiresIn: ACCESS_TOKEN_TTL }),
      refreshToken,
      refreshExpiresAt,
      user,
    };
  }
}
