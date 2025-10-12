import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import languageApiRequest from "@/lib/apis/language";
import {
  CreateLanguageBodyType,
  PaginationLangQueryType,
  UpdateLanguageBodyType,
} from "@/models";

type LanguagesQueryResponse = Awaited<
  ReturnType<typeof languageApiRequest.getAll>
>;

type LanguageQueryResponse = Awaited<
  ReturnType<typeof languageApiRequest.getOne>
>;

type UserLanguagesSpeakingQueryResponse = Awaited<
  ReturnType<typeof languageApiRequest.getUserLanguagesSpeaking>
>;

type UserLanguagesLearningQueryResponse = Awaited<
  ReturnType<typeof languageApiRequest.getUserLanguagesLearning>
>;

type UseLanguagesQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

export const useLanguagesQuery = ({
  enabled = true,
  params,
}: UseLanguagesQueryOptions = {}) => {
  return useQuery<LanguagesQueryResponse>({
    queryKey: ["languages", params ?? null],
    queryFn: () => languageApiRequest.getAll(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

type UseLanguageQueryOptions = {
  enabled?: boolean;
  id?: string;
  lang?: string;
};

export const useLanguageQuery = ({
  id,
  lang,
  enabled = Boolean(id),
}: UseLanguageQueryOptions = {}) => {
  return useQuery<LanguageQueryResponse>({
    queryKey: ["language", id ?? null, lang ?? null],
    queryFn: () => languageApiRequest.getOne(id as string, { lang }),
    enabled: enabled && Boolean(id),
    placeholderData: keepPreviousData,
  });
};

type UseUserLanguagesQueryOptions = {
  enabled?: boolean;
  params?: PaginationLangQueryType;
};

export const useUserLanguagesSpeakingQuery = ({
  enabled = true,
  params,
}: UseUserLanguagesQueryOptions = {}) => {
  return useQuery<UserLanguagesSpeakingQueryResponse>({
    queryKey: ["user-languages-speaking", params ?? null],
    queryFn: () => languageApiRequest.getUserLanguagesSpeaking(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

export const useUserLanguagesLearningQuery = ({
  enabled = true,
  params,
}: UseUserLanguagesQueryOptions = {}) => {
  return useQuery<UserLanguagesLearningQueryResponse>({
    queryKey: ["user-languages-learning", params ?? null],
    queryFn: () => languageApiRequest.getUserLanguagesLearning(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

const languagesQueryKey = (params?: PaginationLangQueryType | null) => [
  "languages",
  params ?? null,
];

type MutationSuccessHandler = (
  response: Awaited<ReturnType<typeof languageApiRequest.create>>
) => void;

const defaultOnSuccess = (
  queryClient: ReturnType<typeof useQueryClient>,
  params?: PaginationLangQueryType | null
) => {
  return () => {
    queryClient.invalidateQueries({ queryKey: languagesQueryKey(params) });
  };
};

export const useCreateLanguageMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLanguageBodyType) =>
      languageApiRequest.create(body),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      options?.onSuccess?.(data);
    },
  });
};

export const useUpdateLanguageMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateLanguageBodyType }) =>
      languageApiRequest.update(id, body),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      queryClient.invalidateQueries({
        queryKey: ["language", variables.id, params?.lang ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};

export const useDeleteLanguageMutation = (
  params?: PaginationLangQueryType,
  options?: {
    onSuccess?: MutationSuccessHandler;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => languageApiRequest.delete(id),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess(queryClient, params)?.();
      queryClient.removeQueries({
        queryKey: ["language", variables, params?.lang ?? null],
      });
      options?.onSuccess?.(data);
    },
  });
};
