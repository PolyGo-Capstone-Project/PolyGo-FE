import { z } from "zod";

// Schema for user status change event from SignalR
export const UserStatusChangedSchema = z.object({
  userId: z.string(),
  isOnline: z.boolean(),
  lastActiveAt: z.string(),
});

// Schema for batch online status check
export const OnlineStatusMapSchema = z.record(z.string(), z.boolean());

// ============= TYPES =============
export type UserStatusChangedType = z.infer<typeof UserStatusChangedSchema>;
export type OnlineStatusMapType = z.infer<typeof OnlineStatusMapSchema>;
