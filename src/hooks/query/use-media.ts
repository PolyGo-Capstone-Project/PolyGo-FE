"use client";

import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import mediaApiRequest, {
  type UploadFilePayload,
  type UploadImagePayload,
  type UploadImagesPayload,
} from "@/lib/apis/media";

type UploadMediaResponse = Awaited<
  ReturnType<typeof mediaApiRequest.uploadImage>
>;

type UploadMultipleMediaResponse = Awaited<
  ReturnType<typeof mediaApiRequest.uploadImages>
>;

type UploadFileResponse = Awaited<
  ReturnType<typeof mediaApiRequest.uploadFile>
>;

export function useUploadMediaMutation(
  options?: UseMutationOptions<UploadMediaResponse, unknown, UploadImagePayload>
) {
  return useMutation<UploadMediaResponse, unknown, UploadImagePayload>({
    mutationFn: (payload) => mediaApiRequest.uploadImage(payload),
    ...options,
  });
}

export function useUploadMultipleMediaMutation(
  options?: UseMutationOptions<
    UploadMultipleMediaResponse,
    unknown,
    UploadImagesPayload
  >
) {
  return useMutation<UploadMultipleMediaResponse, unknown, UploadImagesPayload>(
    {
      mutationFn: (payload) => mediaApiRequest.uploadImages(payload),
      ...options,
    }
  );
}

export function useUploadFileMutation(
  options?: UseMutationOptions<UploadFileResponse, unknown, UploadFilePayload>
) {
  return useMutation<UploadFileResponse, unknown, UploadFilePayload>({
    mutationFn: (payload) => mediaApiRequest.uploadFile(payload),
    ...options,
  });
}

export type {
  UploadFilePayload,
  UploadFileResponse,
  UploadImagePayload,
  UploadImagesPayload,
  UploadMediaResponse,
  UploadMultipleMediaResponse,
};
