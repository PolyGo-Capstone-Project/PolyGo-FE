// src/lib/apis/subscription.ts
import { createGetAll } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  GetCurrentSubscriptionResType,
  GetPlansQueryType,
  GetPlansResType,
  GetSubscriptionUsageQueryType,
  GetSubscriptionUsageResType,
  UpdateAutoRenewResType,
} from "@/models/subscriptionPlan.model";

const prefix = "/subscriptions/plans";
// NEW:
const currentPrefix = "/subscriptions/current";
const usagePrefix = "/subscriptions/usage";
const autoRenewPrefix = "/subscriptions/auto-renew";

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
};

export default subscriptionApiRequest;
