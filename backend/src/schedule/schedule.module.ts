import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleEntity } from './schedule.entity';
import { NurseEntity } from '../nurse/nurse.entity';

@Module({
  // I had to add nurseEntity to the imports because we pull the preferences directly
  imports: [TypeOrmModule.forFeature([ScheduleEntity, NurseEntity])],
  exports: [TypeOrmModule],
  providers: [ScheduleService],
  controllers: [ScheduleController],
})
export class ScheduleModule {}
