export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BLOCKED: "BLOCKED",
} as const;

export const Gender = {
  Male: "Male",
  Female: "Female",
  Other: "Other",
} as const;

export type TypeOfGenderType = (typeof Gender)[keyof typeof Gender];

export const MeritLevel = {
  Banned: "Banned",
  Restricted: "Restricted",
  Monitored: "Monitored",
  Reliable: "Reliable",
  Admin: "Admin",
} as const;

export type MeritLevelType = (typeof MeritLevel)[keyof typeof MeritLevel];
