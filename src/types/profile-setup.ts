export type ProfileSetupData = {
  targetLanguages: string[];
  knownLanguages: string[];
  proficiencyLevel: string;
  interests: string[];
  availableTimes: string[];
  timezone: string;
  weeklyHours: number;
};

export type Language = {
  id: string;
  name: string;
  flag: string;
};

export type ProficiencyLevel = {
  id: string;
  label: string;
  description: string;
};

export type Interest = {
  id: string;
  label: string;
  icon: string;
};

export type AvailabilityTime = {
  id: string;
  label: string;
  time: string;
  icon: string;
};

export type WeeklyHour = {
  value: number;
  label: string;
};
