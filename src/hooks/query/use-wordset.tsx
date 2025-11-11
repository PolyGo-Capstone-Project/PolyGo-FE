import { wordsetApiRequest } from "@/lib/apis";
import {
  CreateWordsetBodyType,
  DeleteWordsetParams,
  DeleteWordsetResType,
  GetAdminWordsetsQueryType,
  GetAdminWordsetsResType,
  GetMyCreatedWordsetsResType,
  GetWordsetByIdQueryType,
  GetWordsetByIdResType,
  GetWordsetsQueryType,
  UpdateWordsetBodyType,
  UpdateWordsetResType,
} from "@/models";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type WordsetsQueryResponse = Awaited<
  ReturnType<typeof wordsetApiRequest.getAll>
>;

// Admin
type GetAdminWordsetsResponse = Awaited<
  ReturnType<typeof wordsetApiRequest.getAdmin>
>;
type UpdateWordsetStatusResponse = Awaited<
  ReturnType<typeof wordsetApiRequest.updateStatus>
>;

/* =============== ADMIN QUERIES =============== */

// Admin – list (lọc theo status, languageIds, difficulty, category, lang, page…)
export const useGetAdminWordsets = (
  query: {
    lang?: string;
    status?: "Draft" | "Pending" | "Approved" | "Rejected";
    languageIds?: string[];
    difficulty?: "Easy" | "Medium" | "Hard";
    category?: string;
    pageNumber?: number;
    pageSize?: number;
  },
  options?: { enabled?: boolean }
) => {
  return useQuery<GetAdminWordsetsResponse>({
    queryKey: ["wordsets", "admin", "list", query],
    queryFn: () => wordsetApiRequest.getAdmin(query),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
  });
};

// Cập nhật trạng thái (Draft/Pending/Approved/Rejected) – kèm optional rejectionReason
// Cập nhật trạng thái (Draft/Pending/Approved/Rejected) – optional rejectionReason
export const useUpdateWordsetStatusMutation = (options?: {
  onSuccess?: (
    data: UpdateWordsetStatusResponse,
    vars: {
      body: {
        wordSetId: string;
        status: "Draft" | "Pending" | "Approved" | "Rejected";
        rejectionReason?: string;
      };
    }
  ) => void;
  onError?: (err: unknown) => void;
}) => {
  const qc = useQueryClient();
  return useMutation({
    // ✅ giờ là PUT
    mutationFn: ({
      body,
    }: {
      body: {
        wordSetId: string;
        status: "Draft" | "Pending" | "Approved" | "Rejected";
        rejectionReason?: string;
      };
    }) => wordsetApiRequest.updateStatus(body),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["wordsets", "admin"] });
      qc.invalidateQueries({
        queryKey: ["wordsets", "one", variables.body.wordSetId],
      });
      qc.invalidateQueries({ queryKey: ["wordsets", "public"] });
      qc.invalidateQueries({ queryKey: ["wordsets", "my-created"] });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

type UseWordsetsQueryOptions = {
  enabled?: boolean;
  params?: GetWordsetsQueryType;
};

type Params = { lang?: string; pageNumber?: number; pageSize?: number };

export const useWordsetsQuery = ({
  enabled = true,
  params,
}: UseWordsetsQueryOptions = {}) => {
  return useQuery<WordsetsQueryResponse>({
    queryKey: ["wordsets", params ?? null],
    queryFn: () => wordsetApiRequest.getAll(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

//Mutation tạo game
export const useCreateWordsetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateWordsetBodyType) => wordsetApiRequest.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wordsets"] });
    },
  });
};

//Query my created wordsets
export const useMyCreatedWordsetsQuery = (params: Params) =>
  useQuery<GetMyCreatedWordsetsResType>({
    queryKey: ["my-created-wordsets", params],
    queryFn: async () => {
      const res = await wordsetApiRequest.getMyCreated(params);
      return res.payload;
    },
  });

/* ============ GET DETAIL HOOK ============ */
export const useWordsetDetailQuery = ({
  id,
  lang,
  enabled = Boolean(id),
}: {
  id?: string;
  lang?: string;
  enabled?: boolean;
}) => {
  return useQuery<GetWordsetByIdResType>({
    queryKey: ["wordset", id ?? null, lang ?? null],
    // unwrap payload để khớp generic useQuery
    queryFn: async () => {
      const res = await wordsetApiRequest.getOne(
        id as string,
        { lang } as GetWordsetByIdQueryType
      );
      return res.payload;
    },
    enabled: enabled && Boolean(id),
    placeholderData: keepPreviousData,
  });
};

/* ============ UPDATE HOOK ============ */
export const useUpdateWordsetMutation = (options?: {
  onSuccess?: (data: UpdateWordsetResType) => void;
}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateWordsetBodyType }) =>
      wordsetApiRequest.update(id, body),
    onSuccess: (res, vars) => {
      // inval chi tiết & các list liên quan
      qc.invalidateQueries({ queryKey: ["wordset", vars.id] });
      qc.invalidateQueries({ queryKey: ["my-created-wordsets"] });
      options?.onSuccess?.(res.payload);
    },
  });
};

/* ============ DELETE HOOK ============ */
export const useDeleteWordsetMutation = (options?: {
  onSuccess?: (
    data: DeleteWordsetResType,
    variables: DeleteWordsetParams
  ) => void;
  onError?: (err: unknown) => void;
}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteWordsetParams) =>
      wordsetApiRequest.delete(params),
    onSuccess: (res, variables) => {
      // unwrap payload để thống nhất với các hook khác
      const payload = res.payload as DeleteWordsetResType | undefined;

      // làm mới các list & detail liên quan
      qc.invalidateQueries({ queryKey: ["my-created-wordsets"] });
      qc.invalidateQueries({ queryKey: ["wordsets"] });
      qc.invalidateQueries({ queryKey: ["wordset", variables.id] });

      // thông báo
      toast.success(payload?.message ?? "Đã xóa bộ câu đố.");

      // callback bên ngoài nếu cần
      options?.onSuccess?.(payload ?? { message: "Success.Delete" }, variables);
    },
    onError: (err) => {
      const msg =
        // các khả năng thường gặp từ http wrapper/axios
        // @ts-expect-error: Error format unhandled
        err?.payload?.message ||
        // @ts-expect-error: Error format unhandled
        err?.response?.data?.message ||
        "Xóa thất bại. Vui lòng thử lại.";
      toast.error(msg);
      options?.onError?.(err);
    },
  });
};

/* ===== Admin list ===== */
export const useAdminWordsetsQuery = (params?: GetAdminWordsetsQueryType) =>
  useQuery<GetAdminWordsetsResType>({
    queryKey: ["admin-wordsets", params ?? null],
    queryFn: async () => {
      const res = await wordsetApiRequest.getAdmin(params);
      return res.payload; // đồng bộ convention trả về payload
    },
    placeholderData: keepPreviousData,
  });
