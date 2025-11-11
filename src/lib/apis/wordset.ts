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
  GetWordsetByIdQueryType,
  GetWordsetByIdResType,
  GetWordsetsQueryType,
  GetWordsetsResType,
  UpdateWordsetBodyType,
  UpdateWordsetResType,
  UpdateWordsetStatusBodyType,
  UpdateWordsetStatusResType,
} from "@/models";

const prefix = "/wordsets";

export type GetWordsetsParams = GetWordsetsQueryType;
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
};

export default wordsetApiRequest;
