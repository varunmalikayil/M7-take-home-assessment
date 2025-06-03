import { Controller, Post, Get, Param, Body, NotImplementedException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}
  
  @Get()
  async getSchedules(): Promise<any> {
    return this.scheduleService.getSchedules();
  }

  @Get('/:id')
  async getSchedule(@Param('id') id: number): Promise<any> {
    return this.scheduleService.getScheduleById(id);
  }

  // generating the schedule, since we're only looking at one week I don't use the dates
  @Post()
  async generateSchedule(
    @Body('startDate') startDate: Date,
    @Body('endDate') endDate: Date
  ): Promise<any> {
    const schedule = await this.scheduleService.generateSchedule(startDate, endDate);
    return schedule;
  }
}
