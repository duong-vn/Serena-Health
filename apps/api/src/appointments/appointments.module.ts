import { Module } from '@nestjs/common';

import { CatalogModule } from '../catalog/catalog.module.js';
import { AppointmentsController } from './appointments.controller.js';
import { AppointmentsService } from './appointments.service.js';

@Module({ imports: [CatalogModule], controllers: [AppointmentsController], providers: [AppointmentsService], exports: [AppointmentsService] })
export class AppointmentsModule {}
