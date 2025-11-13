import { wordsetApiRequest } from "@/lib/apis";
import {
  CreateWordsetBodyType,
  DeleteWordsetParams,
  DeleteWordsetResType,
  GetAdminWordsetsQueryType,
  GetAdminWordsetsResType,
  GetMyCreatedWordsetsResType,
  GetMyPlayedWordsetsResType,
  GetWordsetByIdQueryType,
  GetWordsetByIdResType,
  GetWordsetsQueryType,
  MyBestWordsetScoreResponse,
  PlayWordsetBodyType,
  PlayWordsetResType,
  StartWordsetGameResType,
  UpdateWordsetBodyType,
  UpdateWordsetResType,
  WordsetGameStateResType,
  WordsetLeaderboardResponse,
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

//played tab
export const useMyPlayedWordsetsQuery = (params: Params) =>
  useQuery<GetMyPlayedWordsetsResType>({
    queryKey: ["my-played-wordsets", params],
    queryFn: async () => {
      const res = await wordsetApiRequest.getMyPlayed(params);
      return res.payload; // giữ convention trả về payload
    },
    placeholderData: keepPreviousData,
  });

/* ===== NEW: Leaderboard ===== */
export const useWordsetLeaderboardQuery = (
  id?: string,
  params?: { lang?: string; pageNumber?: number; pageSize?: number },
  options?: { enabled?: boolean }
) =>
  useQuery<WordsetLeaderboardResponse>({
    queryKey: ["wordset", id ?? null, "leaderboard", params ?? null],
    queryFn: async () => {
      const res = await wordsetApiRequest.getLeaderboard(id as string, params);
      return res.payload; // giữ convention payload
    },
    enabled: (options?.enabled ?? true) && Boolean(id),
    placeholderData: keepPreviousData,
  });

/* ===== NEW: My Best Score ===== */
export const useMyBestWordsetScoreQuery = (
  id?: string,
  params?: { lang?: string },
  options?: { enabled?: boolean }
) =>
  useQuery<MyBestWordsetScoreResponse>({
    queryKey: ["wordset", id ?? null, "my-best-score", params ?? null],
    queryFn: async () => {
      const res = await wordsetApiRequest.getMyBestScore(id as string, params);
      return res.payload; // giữ convention payload
    },
    enabled: (options?.enabled ?? true) && Boolean(id),
  });

/* ============ GAMEPLAY: START ============ */
// [ADD] Start game mutation
export const useStartWordsetGameMutation = (options?: {
  onSuccess?: (data: StartWordsetGameResType) => void;
  onError?: (err: unknown) => void;
}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (wordsetId: string) => wordsetApiRequest.startGame(wordsetId),
    onSuccess: (res) => {
      // invalidate game-state ngay sau khi start
      qc.invalidateQueries({
        queryKey: ["wordset", res.payload.data.wordSetId, "game-state"],
      });
      options?.onSuccess?.(res.payload);
    },
    onError: options?.onError,
  });
};

/* ============ GAMEPLAY: PLAY ANSWER ============ */
// [ADD] Play answer mutation
export const usePlayWordsetMutation = (options?: {
  onSuccess?: (data: PlayWordsetResType, vars: PlayWordsetBodyType) => void;
  onError?: (err: unknown) => void;
}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PlayWordsetBodyType) => wordsetApiRequest.play(body),
    onSuccess: (res, vars) => {
      const isCompleted = res.payload?.data?.isCompleted;

      if (isCompleted) {
        // ✅ KHÔNG invalidate nữa để tránh gọi /game-state -> Error.NoActiveGame
        // Có thể dọn cache luôn cho sạch
        qc.removeQueries({
          queryKey: ["wordset", vars.wordSetId, "game-state"],
        });
      } else {
        // Chỉ khi CHƯA hoàn tất mới cần đồng bộ state
        qc.invalidateQueries({
          queryKey: ["wordset", vars.wordSetId, "game-state"],
        });
      }

      options?.onSuccess?.(res.payload, vars);
    },
    onError: options?.onError,
  });
};

/* ============ GAMEPLAY: GAME STATE ============ */
// Cho phép kiểm soát refetchInterval/focus/mount từ ngoài
export const useWordsetGameStateQuery = (
  wordsetId?: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false; // default: false
    refetchOnWindowFocus?: boolean; // default: false
    refetchOnMount?: boolean | "always"; // default: "always"
    staleTime?: number; // default: 10s
    gcTime?: number; // default: 5m
  }
) =>
  useQuery<WordsetGameStateResType>({
    queryKey: ["wordset", wordsetId ?? null, "game-state"],
    queryFn: async () => {
      const res = await wordsetApiRequest.getGameState(wordsetId as string);
      return res.payload;
    },
    enabled: (options?.enabled ?? true) && Boolean(wordsetId),
    placeholderData: keepPreviousData,
    refetchInterval: options?.refetchInterval ?? false, // ⛔ mặc định không poll
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? "always",
    staleTime: options?.staleTime ?? 10_000,
    gcTime: options?.gcTime ?? 5 * 60_000,
  });
