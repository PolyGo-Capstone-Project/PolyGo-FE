import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { badgeApiRequest } from "@/lib/apis";
import {
  CreateBadgeBodyType,
  PaginationLangQueryType,
  UpdateBadgeBodyType,
} from "@/models";

type BadgesQueryResponse = Awaited<ReturnType<typeof badgeApiRequest.getAll>>;

type BadgeQueryResponse = Awaited<ReturnType<typeof badgeApiRequest.getOne>>;

type UseBadgesQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

export const useBadgesQuery = ({
  enabled = true,
  params,
}: UseBadgesQueryOptions = {}) => {
  return useQuery<BadgesQueryResponse>({
    queryKey: ["badges", params ?? null],
    queryFn: () => badgeApiRequest.getAll(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

type UseBadgeQueryOptions = {
  enabled?: boolean;
  id?: string;
  lang?: string;
};

export const useBadgeQuery = ({
  id,
  lang,
  enabled = Boolean(id),
}: UseBadgeQueryOptions = {}) => {
  return useQuery<BadgeQueryResponse>({
    queryKey: ["badge", id ?? null, lang ?? null],
    queryFn: () => badgeApiRequest.getOne(id as string, { lang }),
    enabled: enabled && Boolean(id),
    placeholderData: keepPreviousData,
  });
};

type UseUserBadgesQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

const badgesQueryKey = (params?: PaginationLangQueryType | null) => [
  "badges",
  params ?? null,
];

type MutationSuccessHandler = (
  response: Awaited<ReturnType<typeof badgeApiRequest.create>>
) => void;

const defaultOnSuccess = (
  queryClient: ReturnType<typeof useQueryClient>,
  params?: PaginationLangQueryType | null
) => {
  return () => {
    queryClient.invalidateQueries({ queryKey: badgesQueryKey(params) });
  };
};

export const useCreateBadgeMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBadgeBodyType) => badgeApiRequest.create(body),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      options?.onSuccess?.(data);
    },
  });
};

export const useUpdateBadgeMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBadgeBodyType }) =>
      badgeApiRequest.update(id, body),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      queryClient.invalidateQueries({
        queryKey: ["badge", variables.id, params?.lang ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};

export const useDeleteBadgeMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => badgeApiRequest.delete(id),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      queryClient.removeQueries({
        queryKey: ["badge", variables, params?.lang ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};
