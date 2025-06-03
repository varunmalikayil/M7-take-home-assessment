import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
  
  it('/schedules (POST) should generate a schedule for the given date range', async () => {
    const startDate = '2025-06-10';
    const endDate = '2025-06-16';

    const response = await request(app.getHttpServer())
      .post('/schedules')
      .send({ startDate, endDate })
      .expect(201);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('day');
    expect(response.body[0]).toHaveProperty('shift');
    expect(response.body[0]).toHaveProperty('nurse');
  });

  it('/nurses/:id/preferences (POST) should save preferences for a nurse', async () => {
    const nurseId = 1;
    const preferences = [
      { dayOfWeek: 'Monday', shifts: ['Day', 'Night'] },
      { dayOfWeek: 'Tuesday', shifts: ['Night'] }
    ];

    const response = await request(app.getHttpServer())
      .post(`/nurses/${nurseId}/preferences`)
      .send({ preferences })
      .expect(201);

    expect(response.body).toBeDefined();
  });

  it('/nurses/:id/preferences (POST) should fail if fewer than 3 shifts are selected', async () => {
    const nurseId = 1;
    const preferences = [
      { dayOfWeek: 'Monday', shifts: ['Day'] }, // Only 1 shift total
      { dayOfWeek: 'Tuesday', shifts: [] }      // 0 shifts
    ];

    const response = await request(app.getHttpServer())
      .post(`/nurses/${nurseId}/preferences`)
      .send({ preferences })
      .expect(400); // Should fail validation

    expect(response.body.message).toBe("If preferences are submitted, at least 3 shifts must be selected.");
  });

  it('/nurses/:id/preferences (GET) should retrieve preferences for a nurse', async () => {
    const nurseId = 1;

    const response = await request(app.getHttpServer())
      .get(`/nurses/${nurseId}/preferences`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
  });
});
