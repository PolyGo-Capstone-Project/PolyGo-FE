import { z } from "zod";

// Schema for user status change event from SignalR
export const UserStatusChangedSchema = z.object({
  userId: z.string(),
  isOnline: z.boolean(),
  lastActiveAt: z.string(),
});

// ============= TYPES =============
export type UserStatusChangedType = z.infer<typeof UserStatusChangedSchema>;
