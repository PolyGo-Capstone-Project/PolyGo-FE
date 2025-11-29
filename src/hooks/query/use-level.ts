// src/hooks/use-level.ts
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { levelApiRequest } from "@/lib/apis";
import { PaginationLangQueryType } from "@/models";

/* ====== Query types ====== */

type LevelsQueryResponse = Awaited<ReturnType<typeof levelApiRequest.getAll>>;
type UserLevelsQueryResponse = Awaited<
  ReturnType<typeof levelApiRequest.getUserLevels>
>;

/* ====== Query helpers ====== */

type UseLevelsQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

type UseUserLevelsQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

const levelsQueryKey = (params?: PaginationLangQueryType | null) => [
  "levels",
  params ?? null,
];

const userLevelsQueryKey = (params?: PaginationLangQueryType | null) => [
  "user-levels",
  params ?? null,
];

/* ====== Queries ====== */

// GET /levels
export const useLevelsQuery = ({
  enabled = true,
  params,
}: UseLevelsQueryOptions = {}) => {
  return useQuery<LevelsQueryResponse>({
    queryKey: levelsQueryKey(params ?? null),
    queryFn: () => levelApiRequest.getAll(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

// GET /levels/me
export const useUserLevelsQuery = ({
  enabled = true,
  params,
}: UseUserLevelsQueryOptions = {}) => {
  return useQuery<UserLevelsQueryResponse>({
    queryKey: userLevelsQueryKey(params ?? null),
    queryFn: () => levelApiRequest.getUserLevels(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

/* ====== Mutations ====== */

type ClaimLevelSuccessHandler = (
  response: Awaited<ReturnType<typeof levelApiRequest.claim>>
) => void;

// PUT /levels/claim/:order
export const useClaimLevelMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: ClaimLevelSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: number | string) => levelApiRequest.claim(order),
    onSuccess: (data, variables, context) => {
      // sau khi claim thì refetch lại danh sách level của user
      queryClient.invalidateQueries({
        queryKey: userLevelsQueryKey(params ?? null),
      });

      // (tuỳ chọn) nếu bạn muốn refetch luôn list level chung:
      // queryClient.invalidateQueries({
      //   queryKey: levelsQueryKey(params ?? null),
      // });

      options?.onSuccess?.(data);
    },
  });
};
