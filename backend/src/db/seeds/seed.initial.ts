import { faker } from "@faker-js/faker";
import { NurseEntity } from  "../../nurse/nurse.entity";
import { QueryRunner } from "typeorm"

export const seed = async(queryRunner: QueryRunner) => {
  // Create 15 nurses
  for (let i = 0; i < 15; i++) {
    const nurse = await queryRunner.manager.save(
      // had to make this change due to typeorm taking two fields, had to add the partial
      // for the backend to run and the seeding to work
      queryRunner.manager.create<NurseEntity, Partial<NurseEntity>>(NurseEntity, {
            name: `${faker.person.firstName()} ${faker.person.lastName()}`
        }),
    );
  }
}