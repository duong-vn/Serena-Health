import { Module } from '@nestjs/common';

import { DoctorController } from './doctor.controller.js';

@Module({ controllers: [DoctorController] })
export class DoctorModule {}
