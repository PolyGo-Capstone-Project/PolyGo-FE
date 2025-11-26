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

/* ===== Hook: GET ALL notifications ===== */

export const useNotificationsQuery = ({
  enabled = true,
  params,
}: UseNotificationsQueryOptions = {}) => {
  return useQuery<NotificationsQueryResponse>({
    queryKey: ["notifications", params ?? null],
    queryFn: () => notificationApiRequest.getAll(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

/* ===== Helpers cho mutation ===== */

const notificationsQueryKey = (params?: PaginationLangQueryType | null) => [
  "notifications",
  params ?? null,
];

type MutationSuccessHandler = (
  response: Awaited<ReturnType<typeof notificationApiRequest.markAsRead>>
) => void;

const defaultOnSuccess = (
  queryClient: ReturnType<typeof useQueryClient>,
  params?: PaginationLangQueryType | null
) => {
  return () => {
    queryClient.invalidateQueries({
      queryKey: notificationsQueryKey(params),
    });
  };
};

/* ===== Hook: markAsRead (PUT) ===== */

export const useMarkNotificationReadMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
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
