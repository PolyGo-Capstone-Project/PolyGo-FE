"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import friendApiRequest from "@/lib/apis/friend";
import {
  FriendRequestBodyType,
  GetFriendsQueryType,
  SendFriendRequestBodyType,
} from "@/models";

// ============= TYPE DEFINITIONS =============

type GetFriendsResponse = Awaited<
  ReturnType<typeof friendApiRequest.getFriends>
>;
type GetFriendRequestsResponse = Awaited<
  ReturnType<typeof friendApiRequest.getFriendRequests>
>;
type GetSentFriendRequestsResponse = Awaited<
  ReturnType<typeof friendApiRequest.getSentFriendRequests>
>;
type SendFriendRequestResponse = Awaited<
  ReturnType<typeof friendApiRequest.sendFriendRequest>
>;
type AcceptFriendRequestResponse = Awaited<
  ReturnType<typeof friendApiRequest.acceptFriendRequest>
>;
type RejectFriendRequestResponse = Awaited<
  ReturnType<typeof friendApiRequest.rejectFriendRequest>
>;
type RemoveFriendResponse = Awaited<
  ReturnType<typeof friendApiRequest.removeFriend>
>;
type CancelFriendRequestResponse = Awaited<
  ReturnType<typeof friendApiRequest.cancelFriendRequest>
>;

// ============= QUERY HOOKS =============

/**
 * Hook để lấy danh sách bạn bè
 * @param query - Query parameters cho pagination và filter
 * @param options - React Query options
 */
export const useGetFriends = (
  query: GetFriendsQueryType,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ["friends", query],
    queryFn: () => friendApiRequest.getFriends(query),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
};

/**
 * Hook để lấy danh sách lời mời kết bạn nhận được
 * @param query - Query parameters cho pagination và filter
 * @param options - React Query options
 */
export const useGetFriendRequests = (
  query: GetFriendsQueryType,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ["friend-requests", "received", query],
    queryFn: () => friendApiRequest.getFriendRequests(query),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
};

/**
 * Hook để lấy danh sách lời mời kết bạn đã gửi
 * @param query - Query parameters cho pagination và filter
 * @param options - React Query options
 */
export const useGetSentFriendRequests = (
  query: GetFriendsQueryType,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ["friend-requests", "sent", query],
    queryFn: () => friendApiRequest.getSentFriendRequests(query),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
};

// ============= MUTATION HOOKS =============

/**
 * Hook để gửi lời mời kết bạn
 * @param options - Mutation options với callbacks
 */
export const useSendFriendRequestMutation = (options?: {
  onSuccess?: (data: SendFriendRequestResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (body: SendFriendRequestBodyType) =>
      friendApiRequest.sendFriendRequest(body),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook để chấp nhận lời mời kết bạn
 * @param options - Mutation options với callbacks
 */
export const useAcceptFriendRequestMutation = (options?: {
  onSuccess?: (data: AcceptFriendRequestResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (body: FriendRequestBodyType) =>
      friendApiRequest.acceptFriendRequest(body),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook để từ chối lời mời kết bạn
 * @param options - Mutation options với callbacks
 */
export const useRejectFriendRequestMutation = (options?: {
  onSuccess?: (data: RejectFriendRequestResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (body: FriendRequestBodyType) =>
      friendApiRequest.rejectFriendRequest(body),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook để hủy kết bạn
 * @param options - Mutation options với callbacks
 */
export const useRemoveFriendMutation = (options?: {
  onSuccess?: (data: RemoveFriendResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (friendId: string) => friendApiRequest.removeFriend(friendId),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook để hủy lời mời kết bạn đã gửi
 * @param options - Mutation options với callbacks
 */
export const useCancelFriendRequestMutation = (options?: {
  onSuccess?: (data: CancelFriendRequestResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (receiverId: string) =>
      friendApiRequest.cancelFriendRequest(receiverId),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
