import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import { buildQueryString } from "@/lib/utils";
import {
  CreateWordsetBodyType,
  CreateWordsetResType,
  DeleteWordsetParams,
  DeleteWordsetResponse,
  GetAdminWordsetsQueryType,
  GetAdminWordsetsResType,
  GetMyCreatedWordsetsResType,
  GetMyPlayedWordsetsResType,
  GetWordsetByIdQueryType,
  GetWordsetByIdResType,
  GetWordsetsResType,
  MyBestWordsetScoreResponse,
  PlayWordsetBodyType,
  PlayWordsetResType,
  SearchWordsetsQueryType,
  StartWordsetGameResType,
  UpdateWordsetBodyType,
  UpdateWordsetResType,
  UpdateWordsetStatusBodyType,
  UpdateWordsetStatusResType,
  UseHintBodyType,
  UseHintResType,
  WordsetGameStateResType,
  WordsetLeaderboardResponse,
} from "@/models";

const prefix = "/wordsets";

export type GetWordsetsParams = SearchWordsetsQueryType;
export type GetWordsetByIdParams = GetWordsetByIdQueryType;

export const wordsetApiRequest = {
  // GET ALL
  getAll: createGetAll<GetWordsetsResType, GetWordsetsParams>(prefix),

  // POST CREATE
  create: (body: CreateWordsetBodyType) =>
    http.post<CreateWordsetResType>(`${prefix}`, body),

  // GET my created
  getMyCreated: (params: {
    lang?: string;
    pageNumber?: number;
    pageSize?: number;
  }) =>
    http.get<GetMyCreatedWordsetsResType>(
      `${prefix}/my/created?lang=${params.lang ?? "vi"}&pageNumber=${params.pageNumber ?? 1}&pageSize=${params.pageSize ?? 10}`
    ),

  //Deatil and Edit game
  // GET DETAIL: /wordsets/:id?lang=vi
  getOne: createGetOne<GetWordsetByIdResType, GetWordsetByIdParams>(prefix),

  // UPDATE: PUT /wordsets/:id
  update: (id: string, body: UpdateWordsetBodyType) =>
    http.put<UpdateWordsetResType>(`${prefix}/${id}`, body),

  // DELETE game: DELETE /wordsets/:id
  delete: (params: DeleteWordsetParams) =>
    http.delete<DeleteWordsetResponse>(`${prefix}/${params.id}`),

  /* ===== ADMIN: GET /wordsets/admin ===== */
  getAdmin: (params?: GetAdminWordsetsQueryType) =>
    http.get<GetAdminWordsetsResType>(
      `${prefix}/admin${buildQueryString(params)}`
    ),

  /* ===== ADMIN: PUT /wordsets/admin/status ===== */
  updateStatus: (body: UpdateWordsetStatusBodyType) =>
    http.put<UpdateWordsetStatusResType>(`${prefix}/admin/status`, body),

  //played tab
  // GET my played
  getMyPlayed: (params: {
    lang?: string;
    pageNumber?: number;
    pageSize?: number;
  }) =>
    http.get<GetMyPlayedWordsetsResType>(
      `${prefix}/my/played?lang=${params.lang ?? "vi"}&pageNumber=${params.pageNumber ?? 1}&pageSize=${params.pageSize ?? 10}`
    ),

  // GET leaderboard: /wordsets/:id/leaderboard?lang=&pageNumber=&pageSize=
  getLeaderboard: (
    id: string,
    params?: { lang?: string; pageNumber?: number; pageSize?: number }
  ) =>
    http.get<WordsetLeaderboardResponse>(
      `${prefix}/${id}/leaderboard?lang=${params?.lang ?? "vi"}&pageNumber=${params?.pageNumber ?? 1}&pageSize=${params?.pageSize ?? 10}`
    ),

  // GET my best score: /wordsets/:id/my-best-score?lang=
  getMyBestScore: (id: string, params?: { lang?: string }) =>
    http.get<MyBestWordsetScoreResponse>(
      `${prefix}/${id}/my-best-score?lang=${params?.lang ?? "vi"}`
    ),

  // [ADD] GAMEPLAY: start – POST /wordsets/:id/start
  startGame: (wordsetId: string) =>
    http.post<StartWordsetGameResType>(`${prefix}/${wordsetId}/start`, {}),

  // [ADD] GAMEPLAY: play – POST /wordsets/play
  play: (body: PlayWordsetBodyType) =>
    http.post<PlayWordsetResType>(`${prefix}/play`, body),

  // [ADD] GAMEPLAY: hint – POST /wordsets/:id/hint
  useHint: (wordsetId: string, body: UseHintBodyType) =>
    http.post<UseHintResType>(`${prefix}/${wordsetId}/hint`, body),

  // [ADD] GAMEPLAY: game-state – GET /wordsets/:id/game-state
  getGameState: (wordsetId: string) =>
    http.get<WordsetGameStateResType>(`${prefix}/${wordsetId}/game-state`),
};

export default wordsetApiRequest;
