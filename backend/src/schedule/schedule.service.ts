import { NurseEntity } from '../nurse/nurse.entity';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEntity } from './schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,
    @InjectRepository(NurseEntity)
    private readonly nurseRepository: Repository<NurseEntity>,
  ) {}

  async generateSchedule(startDate: Date, endDate: Date): Promise<any> {
    // we fetch all nurses (and their preferences), and the shift requirements
    const nurses = await this.nurseRepository.find();
    const shiftRequirements = await this.getScheduleRequirements();

    const schedule = [];
    // keep track of how many shifts each nurse has had so far
    const nurseShiftCounts: Record<number, number> = {};
    // keep track of what days nurses have already been assigned, so they don't have to do two in one day
    // one thing to keep in mind with more time i would check to make sure that they don't have a night shift that goes into the day shift on the next day
    const nurseDailyAssignments: Record<number, Set<string>> = {};

    for (const req of shiftRequirements) {
      const assignedNurses: any[] = [];
      const requiredCount = parseInt(req.nursesRequired, 10);

      // Filter out nurses who are already assigned that day
      const preferredNurses = nurses.filter((nurse) => {
        const alreadyAssigned = nurseDailyAssignments[nurse.id]?.has(req.dayOfWeek);
        // only include nurses who said they want to work this day and shift, and aren’t already scheduled
        const isPreferred = nurse.preferences?.some((preference) => {
          const matchesDay = preference.dayOfWeek === req.dayOfWeek;
          const matchesShift = preference.shifts.includes(req.shift);
          return matchesDay && matchesShift;
        });

        return isPreferred && !alreadyAssigned;
      });

      // Sort by least shifts assigned so far for fairness by pairs
      preferredNurses.sort((a, b) => (nurseShiftCounts[a.id] || 0) - (nurseShiftCounts[b.id] || 0));

      for (const nurse of preferredNurses) {
        // break if required count is hit
        if (assignedNurses.length >= requiredCount) break;
        assignedNurses.push(nurse);

        // updating nurse shift count
        nurseShiftCounts[nurse.id] = (nurseShiftCounts[nurse.id] || 0) + 1;

        // keeping track of which days nurses have been assigned today
        if (!nurseDailyAssignments[nurse.id]) nurseDailyAssignments[nurse.id] = new Set();
        nurseDailyAssignments[nurse.id].add(req.dayOfWeek);
      }

      // grabbing the unassigned nurses for the day, filtering out assigned
      const unassignedNurses = nurses.filter((nurse) => {
        const alreadyAssigned = nurseDailyAssignments[nurse.id]?.has(req.dayOfWeek);
        return !alreadyAssigned && !assignedNurses.includes(nurse);
      });

      // sort by fewest shifts so far for fairness by pairs again
      unassignedNurses.sort((a, b) => (nurseShiftCounts[a.id] || 0) - (nurseShiftCounts[b.id] || 0));

      for (const nurse of unassignedNurses) {
        // stop assigning if we've hit the needed number of nurses for this shift
        if (assignedNurses.length >= requiredCount) break;
        assignedNurses.push(nurse);

        // increase total shift count
        if (!nurseShiftCounts[nurse.id]) {
          nurseShiftCounts[nurse.id] = 1;
        } else {
          nurseShiftCounts[nurse.id]++;
        }

        // keeping trac that this nurse is now working on this day
        if (!nurseDailyAssignments[nurse.id]) {
          nurseDailyAssignments[nurse.id] = new Set();
        }
        nurseDailyAssignments[nurse.id].add(req.dayOfWeek);
      }

      // updating schedule
      for (const nurse of assignedNurses) {
        schedule.push({
          day: req.dayOfWeek,
          shift: req.shift,
          nurse: nurse.name,
        });
      }
    }

    return schedule;
  }

  async getSchedules(): Promise<any> {
    return this.scheduleRepository.find();
  }

  async getScheduleById(id: number): Promise<any> {
    return this.scheduleRepository.findOneByOrFail({id});
  }

  // only reading from the shiftRequirements file for now, can make it dynamically loaded from the db later
  async getScheduleRequirements(): Promise<any> {
    const filePath = path.join(process.cwd(), './src/shift/shiftRequirements.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const shiftRequirements = JSON.parse(fileContents)["shiftRequirements"];
    return shiftRequirements;
  }
}
