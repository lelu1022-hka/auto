import { AuthModule } from '../../security/auth/auth.module.js';
import { Auto } from '../../auto/entity/auto.entity.js';
import { DbPopulateController } from './db-populate.controller.js';
import { DbPopulateService } from './db-populate.service.js';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Auto]), AuthModule],
    controllers: [DbPopulateController],
    providers: [DbPopulateService],
    exports: [DbPopulateService],
})
export class DevModule {}
