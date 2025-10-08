import { z } from "zod";

export const MessageResSchema = z.object({
  data: null,
  message: z.string(),
});

export type MessageResType = z.infer<typeof MessageResSchema>;
