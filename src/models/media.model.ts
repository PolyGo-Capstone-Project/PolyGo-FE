import { z } from "zod";

export const UploadMediaResSchema = z.object({
  data: z.string(),
  message: z.string(),
});

export type UploadMediaResType = z.infer<typeof UploadMediaResSchema>;
