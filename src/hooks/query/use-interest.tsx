import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { interestApiRequest } from "@/lib/apis";
import {
  CreateInterestBodyType,
  PaginationLangQueryType,
  UpdateInterestBodyType,
} from "@/models";

type InterestsQueryResponse = Awaited<
  ReturnType<typeof interestApiRequest.getAll>
>;

type InterestQueryResponse = Awaited<
  ReturnType<typeof interestApiRequest.getOne>
>;

type UseInterestsQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

export const useInterestsQuery = ({
  enabled = true,
  params,
}: UseInterestsQueryOptions = {}) => {
  return useQuery<InterestsQueryResponse>({
    queryKey: ["interests", params ?? null],
    queryFn: () => interestApiRequest.getAll(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

type UseInterestQueryOptions = {
  enabled?: boolean;
  id?: string;
  lang?: string;
};

export const useInterestQuery = ({
  id,
  lang,
  enabled = Boolean(id),
}: UseInterestQueryOptions = {}) => {
  return useQuery<InterestQueryResponse>({
    queryKey: ["interest", id ?? null, lang ?? null],
    queryFn: () => interestApiRequest.getOne(id as string, { lang }),
    enabled: enabled && Boolean(id),
    placeholderData: keepPreviousData,
  });
};

const interestsQueryKey = (params?: PaginationLangQueryType | null) => [
  "interests",
  params ?? null,
];

type MutationSuccessHandler = (
  response: Awaited<ReturnType<typeof interestApiRequest.create>>
) => void;

const defaultOnSuccess = (
  queryClient: ReturnType<typeof useQueryClient>,
  params?: PaginationLangQueryType | null
) => {
  return () => {
    queryClient.invalidateQueries({ queryKey: interestsQueryKey(params) });
  };
};

export const useCreateInterestMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInterestBodyType) =>
      interestApiRequest.create(body),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      options?.onSuccess?.(data);
    },
  });
};

export const useUpdateInterestMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateInterestBodyType }) =>
      interestApiRequest.update(id, body),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      queryClient.invalidateQueries({
        queryKey: ["interest", variables.id, params?.lang ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};

export const useDeleteInterestMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => interestApiRequest.delete(id),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      queryClient.removeQueries({
        queryKey: ["interest", variables, params?.lang ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};
