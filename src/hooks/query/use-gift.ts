import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { giftApiRequest } from "@/lib/apis";
import {
  CreateGiftBodyType,
  GiftVisibilityBodyType,
  PaginationLangQueryType,
  PresentGiftBodyType,
  PurchaseGiftBodyType,
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

// ==================== User APIs ====================

// Purchase Gift
type PurchaseGiftResponse = Awaited<ReturnType<typeof giftApiRequest.purchase>>;

export const usePurchaseGiftMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: (response: PurchaseGiftResponse) => void;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PurchaseGiftBodyType) => giftApiRequest.purchase(body),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["my-purchased-gifts", params ?? null],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-purchased-gifts-history", params ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};

// My Purchased Gifts
type MyPurchasedGiftsResponse = Awaited<
  ReturnType<typeof giftApiRequest.myPurchasedGifts>
>;

type UseMyPurchasedGiftsQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

export const useMyPurchasedGiftsQuery = ({
  enabled = true,
  params,
}: UseMyPurchasedGiftsQueryOptions = {}) => {
  return useQuery<MyPurchasedGiftsResponse>({
    queryKey: ["my-purchased-gifts", params ?? null],
    queryFn: () => giftApiRequest.myPurchasedGifts(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

// My Purchased Gifts History (All)
type MyPurchasedGiftHistoryResponse = Awaited<
  ReturnType<typeof giftApiRequest.myAllPurchasedGiftsHistory>
>;

type UseMyPurchasedGiftHistoryQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

export const useMyPurchasedGiftHistoryQuery = ({
  enabled = true,
  params,
}: UseMyPurchasedGiftHistoryQueryOptions = {}) => {
  return useQuery<MyPurchasedGiftHistoryResponse>({
    queryKey: ["my-purchased-gifts-history", params ?? null],
    queryFn: () => giftApiRequest.myAllPurchasedGiftsHistory(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

// My Purchased Gift History Detail
type MyPurchasedGiftHistoryDetailResponse = Awaited<
  ReturnType<typeof giftApiRequest.myPurchasedGiftHistory>
>;

type UseMyPurchasedGiftHistoryDetailQueryOptions = {
  enabled?: boolean;
  id?: string;
  lang?: string;
};

export const useMyPurchasedGiftHistoryDetailQuery = ({
  id,
  lang,
  enabled = Boolean(id),
}: UseMyPurchasedGiftHistoryDetailQueryOptions = {}) => {
  return useQuery<MyPurchasedGiftHistoryDetailResponse>({
    queryKey: ["my-purchased-gift-history-detail", id ?? null, lang ?? null],
    queryFn: () =>
      giftApiRequest.myPurchasedGiftHistory(id as string, {
        lang,
      }),
    enabled: enabled && Boolean(id),
    placeholderData: keepPreviousData,
  });
};

// Present Gift
type PresentGiftResponse = Awaited<ReturnType<typeof giftApiRequest.present>>;

export const usePresentGiftMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: (response: PresentGiftResponse) => void;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PresentGiftBodyType) => giftApiRequest.present(body),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["my-sent-gifts", params ?? null],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-purchased-gifts", params ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};

// My Sent Gifts
type MySentGiftsResponse = Awaited<
  ReturnType<typeof giftApiRequest.mySentGifts>
>;

type UseMySentGiftsQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

export const useMySentGiftsQuery = ({
  enabled = true,
  params,
}: UseMySentGiftsQueryOptions = {}) => {
  return useQuery<MySentGiftsResponse>({
    queryKey: ["my-sent-gifts", params ?? null],
    queryFn: () => giftApiRequest.mySentGifts(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

// My Received Gifts
type MyReceivedGiftsResponse = Awaited<
  ReturnType<typeof giftApiRequest.myReceivedGifts>
>;

type UseMyReceivedGiftsQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

export const useMyReceivedGiftsQuery = ({
  enabled = true,
  params,
}: UseMyReceivedGiftsQueryOptions = {}) => {
  return useQuery<MyReceivedGiftsResponse>({
    queryKey: ["my-received-gifts", params ?? null],
    queryFn: () => giftApiRequest.myReceivedGifts(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

// Update Gift Visibility
type UpdateGiftVisibilityResponse = Awaited<
  ReturnType<typeof giftApiRequest.updateVisibility>
>;

export const useUpdateGiftVisibilityMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: (response: UpdateGiftVisibilityResponse) => void;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: GiftVisibilityBodyType }) =>
      giftApiRequest.updateVisibility(id, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["my-received-gifts", params ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};
