export const Role = {
  Guest: "GUEST",
  User: "USER",
  Admin: "ADMIN",
  AiModule: "AI_MODULE",
} as const;

export const RoleValues = [
  Role.Guest,
  Role.User,
  Role.Admin,
  Role.AiModule,
] as const;

export type RoleType = (typeof Role)[keyof typeof Role];

export const HTTPMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
  OPTIONS: "OPTIONS",
  HEAD: "HEAD",
} as const;
