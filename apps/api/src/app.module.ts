import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppointmentsModule } from './appointments/appointments.module.js';
import { AiModule } from './ai/ai.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
import { RolesGuard } from './auth/roles.guard.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { validateEnvironment } from './config/environment.js';
import { ConsultationsModule } from './consultations/consultations.module.js';
import { ConversationsModule } from './conversations/conversations.module.js';
import { DoctorModule } from './doctor/doctor.module.js';
import { ExpertModule } from './expert/expert.module.js';
import { ManagerModule } from './manager/manager.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProfileModule } from './profile/profile.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    ProfileModule,
    CatalogModule,
    AppointmentsModule,
    AiModule,
    ConsultationsModule,
    ConversationsModule,
    DoctorModule,
    ExpertModule,
    ManagerModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
