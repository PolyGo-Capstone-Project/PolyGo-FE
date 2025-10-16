import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CreateGiftBodyType,
  GetGiftByIdQueryType,
  GetGiftByIdResType,
  GetGiftsQueryType,
  GetGiftsResType,
  GetMyPurchasedGiftHistoryResType,
  GetMyPurchasedGiftsResType,
  GetMyReceivedGiftsResType,
  GetMySentGiftsResType,
  MessageResType,
  PresentGiftBodyType,
  PurchaseGiftBodyType,
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
  //User
  purchase: (body: PurchaseGiftBodyType) =>
    http.post<MessageResType>(`${prefix}/purchase`, body),
  myPurchasedGifts: createGetAll<GetMyPurchasedGiftsResType, GetGiftsQueryType>(
    `${prefix}/me`
  ),
  myAllPurchasedGiftsHistory: createGetAll<
    GetMyPurchasedGiftHistoryResType,
    GetGiftsQueryType
  >(`${prefix}/purchase-history`),
  myPurchasedGiftHistory: createGetOne<GetGiftByIdResType, GetGiftParams>(
    prefix
  ),
  //present
  present: (body: PresentGiftBodyType) =>
    http.post<MessageResType>(`${prefix}/present`, body),
  // my sent/received gifts
  mySentGifts: createGetAll<GetMySentGiftsResType, GetGiftsQueryType>(
    `${prefix}/sent`
  ),
  myReceivedGifts: createGetAll<GetMyReceivedGiftsResType, GetGiftsQueryType>(
    `${prefix}/received`
  ),
  // accept/reject gift
  acceptGift: (id: string) =>
    http.put<MessageResType>(`${prefix}/${id}/accept`, null),
  rejectGift: (id: string) =>
    http.put<MessageResType>(`${prefix}/${id}/reject`, null),
};

export default giftApiRequest;
