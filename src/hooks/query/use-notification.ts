import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { notificationApiRequest } from "@/lib/apis";
import { PaginationLangQueryType } from "@/models";

/* ===== Types cho useQuery ===== */

type NotificationsQueryResponse = Awaited<
  ReturnType<typeof notificationApiRequest.getAll>
>;

type UseNotificationsQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

const notificationsKey = {
  base: (lang?: string) => ["notifications", lang ?? "all"] as const,
  list: (params?: PaginationLangQueryType | null) =>
    [...notificationsKey.base(params?.lang), "list", params ?? null] as const,
};

/* ===== Hook: GET ALL notifications ===== */

export const useNotificationsQuery = ({
  enabled = true,
  params,
}: UseNotificationsQueryOptions = {}) => {
  return useQuery<NotificationsQueryResponse>({
    queryKey: notificationsKey.list(params ?? null),
    queryFn: () => notificationApiRequest.getAll(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

/* ===== Helpers cho mutation ===== */

// const notificationsQueryKey = (params?: PaginationLangQueryType | null) => [
//   "notifications",
//   params ?? null,
// ];

type MutationReadSuccessHandler = (
  response: Awaited<ReturnType<typeof notificationApiRequest.markAsRead>>
) => void;

type MutationReadAllSuccessHandler = (
  response: Awaited<ReturnType<typeof notificationApiRequest.readAll>>
) => void;

const defaultOnSuccess = (
  queryClient: ReturnType<typeof useQueryClient>,
  params?: PaginationLangQueryType | null
) => {
  return () => {
    queryClient.invalidateQueries({
      queryKey: notificationsKey.base(params?.lang),
    });
  };
};

/* ===== Hook: markAsRead (PUT) ===== */

export const useMarkNotificationReadMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationReadSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApiRequest.markAsRead(id),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      options?.onSuccess?.(data);
    },
  });
};

export const useNotificationReadAllMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationReadAllSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApiRequest.readAll(),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      options?.onSuccess?.(data);
    },
  });
};
