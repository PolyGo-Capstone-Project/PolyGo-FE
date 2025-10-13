import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { giftApiRequest } from "@/lib/apis";
import {
  CreateGiftBodyType,
  PaginationLangQueryType,
  UpdateGiftBodyType,
} from "@/models";

type GiftsQueryResponse = Awaited<ReturnType<typeof giftApiRequest.getAll>>;

type GiftQueryResponse = Awaited<ReturnType<typeof giftApiRequest.getOne>>;

type UseGiftsQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

export const useGiftsQuery = ({
  enabled = true,
  params,
}: UseGiftsQueryOptions = {}) => {
  return useQuery<GiftsQueryResponse>({
    queryKey: ["gifts", params ?? null],
    queryFn: () => giftApiRequest.getAll(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

type UseGiftQueryOptions = {
  enabled?: boolean;
  id?: string;
  lang?: string;
};

export const useGiftQuery = ({
  id,
  lang,
  enabled = Boolean(id),
}: UseGiftQueryOptions = {}) => {
  return useQuery<GiftQueryResponse>({
    queryKey: ["gift", id ?? null, lang ?? null],
    queryFn: () => giftApiRequest.getOne(id as string, { lang }),
    enabled: enabled && Boolean(id),
    placeholderData: keepPreviousData,
  });
};

type UseUserGiftsQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

const giftsQueryKey = (params?: PaginationLangQueryType | null) => [
  "gifts",
  params ?? null,
];

type MutationSuccessHandler = (
  response: Awaited<ReturnType<typeof giftApiRequest.create>>
) => void;

const defaultOnSuccess = (
  queryClient: ReturnType<typeof useQueryClient>,
  params?: PaginationLangQueryType | null
) => {
  return () => {
    queryClient.invalidateQueries({ queryKey: giftsQueryKey(params) });
  };
};

export const useCreateGiftMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGiftBodyType) => giftApiRequest.create(body),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      options?.onSuccess?.(data);
    },
  });
};

export const useUpdateGiftMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateGiftBodyType }) =>
      giftApiRequest.update(id, body),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      queryClient.invalidateQueries({
        queryKey: ["gift", variables.id, params?.lang ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};

export const useDeleteGiftMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => giftApiRequest.delete(id),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      queryClient.removeQueries({
        queryKey: ["gift", variables, params?.lang ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};
