// did some reseach and I read that DTOs (data transfer objects) are recommended
// to make sure the request body passes something we expect

export class UpdatePreferencesDto {
    preferences: { dayOfWeek: string; shifts: string[] }[];
  }