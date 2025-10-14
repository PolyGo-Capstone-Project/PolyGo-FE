"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import userApiRequest from "@/lib/apis/user";
import {
  GetUsersMatchingQueryType,
  GetUsersQueryType,
  SetRestrictionsBodyType,
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

// ============= ADMIN HOOKS =============

type GetUsersResponse = Awaited<ReturnType<typeof userApiRequest.getUsers>>;
type GetUserResponse = Awaited<ReturnType<typeof userApiRequest.getOne>>;
type SetRestrictionsResponse = Awaited<
  ReturnType<typeof userApiRequest.setRestrictions>
>;

// GET /admin/users - Get all users with pagination
export const useGetUsers = (
  query: GetUsersQueryType,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ["users", query],
    queryFn: () => userApiRequest.getUsers(query),
    enabled: options?.enabled,
  });
};

// GET /admin/users/:id - Get user by ID
export const useGetUser = (
  id: string,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => userApiRequest.getOne(id),
    enabled: options?.enabled,
  });
};

// PUT /users/set-restrictions/:id - Set user restrictions
export const useSetRestrictionsMutation = (options?: {
  onSuccess?: (data: SetRestrictionsResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: ({ body, id }: { body: SetRestrictionsBodyType; id: string }) =>
      userApiRequest.setRestrictions(body, id),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

// ============= FOR USER NOT ADMIN =============

// matching
export const useGetUsersMatching = (
  query: GetUsersMatchingQueryType,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ["users", query],
    queryFn: () => userApiRequest.getUsersMatching(query),
    enabled: options?.enabled,
  });
};

// GET /users/:id - Get user by ID
export const useGetUserProfile = (
  id: string,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => userApiRequest.getUserProfile(id),
    enabled: options?.enabled,
  });
};
