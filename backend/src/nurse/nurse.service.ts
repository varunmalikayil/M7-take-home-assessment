import { BadRequestException, Injectable } from '@nestjs/common';
import { NurseEntity } from './nurse.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NurseService {
  constructor(
    @InjectRepository(NurseEntity)
    private nurseRepository: Repository<NurseEntity>,
  ) {}

  async getNurses(): Promise<NurseEntity[]> {
    return this.nurseRepository.find();
  }
  
  // business logic for getting the preferences based on the id
  async getPreferences(id: number): Promise<{ dayOfWeek: string; shifts: string[] }[] | null> {
    const nurse = await this.nurseRepository.findOneByOrFail({ id });
    return nurse.preferences || null;
  }

  // business logic for setting the preferences and validating selections
  async setPreferences(id: number, preferences: any): Promise<NurseEntity> {
    let totalShiftCount = 0;
    for (const p of preferences) {
      if (Array.isArray(p.shifts)) {
        totalShiftCount += p.shifts.length;
      }
    }

    if (totalShiftCount > 0 && totalShiftCount < 3) {
      throw new BadRequestException("If preferences are submitted, at least 3 shifts must be selected.");
    }
    const nurse = await this.nurseRepository.findOneByOrFail({id});
    if (!nurse) {
      throw new Error(`Nurse with ID ${id} not found`);
    }
    nurse.preferences = preferences;
    return this.nurseRepository.save(nurse);
  }
}
