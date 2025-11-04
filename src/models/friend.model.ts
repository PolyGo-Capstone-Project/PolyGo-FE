import z from "zod";

export const FriendSchema = z.object({
  id: z.string(),
});

//types:
export type FriendType = z.infer<typeof FriendSchema>;
