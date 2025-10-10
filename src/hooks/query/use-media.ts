"use client";

import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import mediaApiRequest, { type UploadImagePayload } from "@/lib/apis/media";

type UploadMediaResponse = Awaited<
  ReturnType<typeof mediaApiRequest.uploadImage>
>;

export function useUploadMediaMutation(
  options?: UseMutationOptions<UploadMediaResponse, unknown, UploadImagePayload>
) {
  return useMutation<UploadMediaResponse, unknown, UploadImagePayload>({
    mutationFn: (payload) => mediaApiRequest.uploadImage(payload),
    ...options,
  });
}

export type { UploadImagePayload, UploadMediaResponse };
