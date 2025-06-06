import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import { ShiftEntity } from '../shift/shift.entity';


@Entity('nurses')
export class NurseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column('json', { nullable: true })
  // [
  //   { "dayOfWeek": "Monday", "shifts": ["day", "night"] }
  // ]
  preferences: { dayOfWeek: string; shifts: string[] }[];

  @OneToMany(() => ShiftEntity, shift => shift.nurse)
  shifts: ShiftEntity[];
}
