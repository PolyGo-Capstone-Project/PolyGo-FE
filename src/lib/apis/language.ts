import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CreateLanguageBodyType,
  GetLanguageByIdQueryType,
  GetLanguageByIdResType,
  GetLanguagesQueryType,
  GetLanguagesResType,
  MessageResType,
  UpdateLanguageBodyType,
} from "@/models";

const prefix = "/languages";

export type GetLanguagesParams = GetLanguagesQueryType;
export type GetLanguageParams = GetLanguageByIdQueryType;

const languageApiRequest = {
  getAll: createGetAll<GetLanguagesResType, GetLanguagesParams>(prefix),
  getOne: createGetOne<GetLanguageByIdResType, GetLanguageParams>(prefix),
  create: (body: CreateLanguageBodyType) =>
    http.post<MessageResType>(`${prefix}`, body),
  update: (id: string, body: UpdateLanguageBodyType) =>
    http.put<MessageResType>(`${prefix}/${id}`, body),
  delete: (id: string) => http.delete<MessageResType>(`${prefix}/${id}`),
};

export default languageApiRequest;
