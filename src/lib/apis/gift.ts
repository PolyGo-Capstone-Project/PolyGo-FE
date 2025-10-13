import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CreateGiftBodyType,
  GetGiftByIdQueryType,
  GetGiftByIdResType,
  GetGiftsQueryType,
  GetGiftsResType,
  MessageResType,
  UpdateGiftBodyType,
} from "@/models";

const prefix = "/gifts";

export type GetGiftsParams = GetGiftsQueryType;
export type GetGiftParams = GetGiftByIdQueryType;
const giftApiRequest = {
  //Admin
  getAll: createGetAll<GetGiftsResType, GetGiftsParams>(prefix),
  getOne: createGetOne<GetGiftByIdResType, GetGiftParams>(prefix),
  create: (body: CreateGiftBodyType) =>
    http.post<MessageResType>(`${prefix}`, body),
  update: (id: string, body: UpdateGiftBodyType) =>
    http.put<MessageResType>(`${prefix}/${id}`, body),
  delete: (id: string) => http.delete<MessageResType>(`${prefix}/${id}`),
};

export default giftApiRequest;
