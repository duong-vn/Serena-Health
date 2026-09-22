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
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return this.issue(safeUser);
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
    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role, expiresAt: payload.exp * 1000 };
  }

  private async issue<T extends { id: string; email: string; role: Role }>(user: T) {
    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role }),
      user,
    };
  }
}
