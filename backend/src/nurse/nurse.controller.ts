import { Controller, Get, Post, Body, Param } from '@nestjs/common';  
import { NurseService } from './nurse.service';  
import { NurseEntity } from './nurse.entity';  
import { UpdatePreferencesDto } from './nurse.dto';

@Controller('nurses')  
export class NurseController {  
  constructor(private readonly nurseService: NurseService) {}  

  @Get()
  async getNurses(): Promise<NurseEntity[]> {
    return this.nurseService.getNurses();
  }

  // getting the preferences for a nurse in particular
  @Get(':id/preferences')
  async getPreferences(@Param('id') id: number): Promise<any> {
    return this.nurseService.getPreferences(Number(id));
  }

  @Post(':id/reset')
  resetPreferences(@Param('id') id: number) {
    return this.nurseService.setPreferences(Number(id), []);
  }
  
  // updating the preferences for a nurse
  @Post(':id/preferences')  
  async setPreferences(
    @Param('id') id: number, 
    @Body() body: UpdatePreferencesDto
  ): Promise<any> {
    console.log(`Saving preferences for nurse ${id}:`, body.preferences);
    return this.nurseService.setPreferences(Number(id), body.preferences);
  }
}
