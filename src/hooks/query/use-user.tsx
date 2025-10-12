"use client";

import { useMutation } from "@tanstack/react-query";

import userApiRequest from "@/lib/apis/user";
import {
  SetupProfileBodyType,
  UpdateMeBodyType,
  UpdateProfileBodyType,
} from "@/models";

type UpdateMeResponse = Awaited<ReturnType<typeof userApiRequest.updateMe>>;
type SetupProfileResponse = Awaited<
  ReturnType<typeof userApiRequest.setupProfile>
>;
type UpdateProfileResponse = Awaited<
  ReturnType<typeof userApiRequest.updateProfile>
>;

export const useUpdateMeMutation = (options?: {
  onSuccess?: (data: UpdateMeResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (body: UpdateMeBodyType) => userApiRequest.updateMe(body),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useSetupProfileMutation = (options?: {
  onSuccess?: (data: SetupProfileResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (body: SetupProfileBodyType) =>
      userApiRequest.setupProfile(body),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateProfileMutation = (options?: {
  onSuccess?: (data: UpdateProfileResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (body: UpdateProfileBodyType) =>
      userApiRequest.updateProfile(body),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
