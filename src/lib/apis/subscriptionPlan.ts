// src/lib/apis/subscription.ts
import { createGetAll } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CancelSubscriptionResType,
  GetCurrentSubscriptionResType,
  GetPlansQueryType,
  GetPlansResType,
  GetSubscriptionUsageQueryType,
  GetSubscriptionUsageResType,
  SubscribeBodyType,
  SubscribeResType,
  UpdateAutoRenewResType,
} from "@/models/subscriptionPlan.model";

const prefix = "/subscriptions/plans";
// NEW:
const currentPrefix = "/subscriptions/current";
const usagePrefix = "/subscriptions/usage";
const autoRenewPrefix = "/subscriptions/auto-renew";
const cancelPrefix = "/subscriptions/cancel";
const subscribePrefix = "/subscriptions/subscribe";

export type GetPlansParams = GetPlansQueryType;
// NEW:
export type GetSubscriptionUsageParams = GetSubscriptionUsageQueryType;

const subscriptionApiRequest = {
  // Plans (giữ nguyên)
  getAll: createGetAll<GetPlansResType, GetPlansParams>(prefix),
  // (optional) getOne: createGetOne<GetPlanByIdResType, GetPlanByIdQueryType>(prefix)

  // NEW: current subscription
  getCurrent: createGetAll<GetCurrentSubscriptionResType>(currentPrefix),

  // NEW: usage of current subscription
  getUsage: createGetAll<
    GetSubscriptionUsageResType,
    GetSubscriptionUsageParams
  >(usagePrefix),

  // add other endpoints if needed (create/update/delete) using http.post/put/delete

  // NEW: Toggle auto-renew
  toggleAutoRenew: (autoRenew: boolean) =>
    http.put<UpdateAutoRenewResType>(
      `${autoRenewPrefix}?autoRenew=${autoRenew}`,
      null
    ),

  // NEW: Cancel subscription
  // NEW: Cancel current subscription (POST body: { reason })
  cancelCurrent: (reason: string) =>
    http.post<CancelSubscriptionResType>(cancelPrefix, { reason }),

  // NEW: subscribe to a plan
  subscribe: (body: SubscribeBodyType) =>
    http.post<SubscribeResType>(subscribePrefix, body),
};

export default subscriptionApiRequest;
