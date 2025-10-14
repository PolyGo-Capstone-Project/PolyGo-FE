import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CreateSubscriptionBodyType,
  GetSubscriptionByIdQueryType,
  GetSubscriptionByIdResType,
  GetSubscriptionsQueryType,
  GetSubscriptionsResType,
  MessageResType,
  UpdateSubscriptionBodyType,
} from "@/models";

const prefix = "/subscriptions";

export type GetSubscriptionsParams = GetSubscriptionsQueryType;
export type GetSubscriptionParams = GetSubscriptionByIdQueryType;
const subscriptionApiRequest = {
  //Admin
  getAll: createGetAll<GetSubscriptionsResType, GetSubscriptionsParams>(prefix),
  getOne: createGetOne<GetSubscriptionByIdResType, GetSubscriptionParams>(
    prefix
  ),
  create: (body: CreateSubscriptionBodyType) =>
    http.post<MessageResType>(`${prefix}`, body),
  update: (id: string, body: UpdateSubscriptionBodyType) =>
    http.put<MessageResType>(`${prefix}/${id}`, body),
  delete: (id: string) => http.delete<MessageResType>(`${prefix}/${id}`),
};

export default subscriptionApiRequest;
