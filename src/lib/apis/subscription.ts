import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CancelSubscriptionBodyType,
  CreateSubscriptionBodyType,
  GetCurrentSubscriptionResType,
  GetSubscriptionByIdQueryType,
  GetSubscriptionByIdResType,
  GetSubscriptionPlansResType,
  GetSubscriptionsQueryType,
  GetSubscriptionsResType,
  GetUsageSubscriptionResType,
  MessageResType,
  SubscribeBodyType,
  UpdateAutoRenewBodyType,
  UpdateSubscriptionBodyType,
} from "@/models";

const prefix = "/subscriptions";

export type GetSubscriptionsParams = GetSubscriptionsQueryType;
export type GetSubscriptionParams = GetSubscriptionByIdQueryType;

const subscriptionApiRequest = {
  //ADMIN:
  getAll: createGetAll<GetSubscriptionsResType, GetSubscriptionsParams>(prefix),
  getOne: createGetOne<GetSubscriptionByIdResType, GetSubscriptionParams>(
    prefix
  ),
  create: (body: CreateSubscriptionBodyType) =>
    http.post<MessageResType>(`${prefix}`, body),
  update: (id: string, body: UpdateSubscriptionBodyType) =>
    http.put<MessageResType>(`${prefix}/${id}`, body),
  delete: (id: string) => http.delete<MessageResType>(`${prefix}/${id}`),
  //USER:
  getPlan: createGetAll<GetSubscriptionPlansResType, GetSubscriptionsParams>(
    `${prefix}/plans`
  ),
  getCurrent: createGetAll<
    GetCurrentSubscriptionResType,
    GetSubscriptionsParams
  >(`${prefix}/current`),
  getUsage: createGetAll<GetUsageSubscriptionResType, GetSubscriptionsParams>(
    `${prefix}/usage`
  ),
  subscribe: (body: SubscribeBodyType) =>
    http.post<MessageResType>(`${prefix}/subscribe`, body),
  cancel: (body: CancelSubscriptionBodyType) =>
    http.post<MessageResType>(`${prefix}/cancel`, body),
  updateAutoRenew: (body: UpdateAutoRenewBodyType) =>
    http.put<MessageResType>(`${prefix}/auto-renew`, body),
};

export default subscriptionApiRequest;
