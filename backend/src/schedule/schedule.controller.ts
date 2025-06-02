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

  @Post()
  async generateSchedule(@Body('startDate') startDate: Date, @Body('endDate') endDate: Date): Promise<any> {
    // TODO: Complete the implementation of this method
    // Each time this method is called, a new schedule should be generated
    // based on current nurse preferences and schedule requirements for the given dates
    throw new NotImplementedException();
  }
}
