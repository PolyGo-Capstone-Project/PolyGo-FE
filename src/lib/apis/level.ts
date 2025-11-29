// src/lib/apis/level.ts
import { createGetAll } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  GetLevelsQueryType,
  GetLevelsResType,
  GetUserLevelsResType,
  MessageResType,
} from "@/models";

const prefix = "/levels";

export type GetLevelsParams = GetLevelsQueryType;

const levelApiRequest = {
  // GET /levels?lang=vi&pageNumber=-1&pageSize=-1
  getAll: createGetAll<GetLevelsResType, GetLevelsParams>(prefix),

  // GET /levels/me?lang=vi&pageNumber=-1&pageSize=-1
  getUserLevels: createGetAll<GetUserLevelsResType, GetLevelsParams>(
    `${prefix}/me`
  ),

  // PUT /levels/claim/2
  claim: (order: string | number) =>
    http.put<MessageResType>(`${prefix}/claim/${order}`, {}),
};

export default levelApiRequest;
