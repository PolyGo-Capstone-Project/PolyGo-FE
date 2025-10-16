// src/lib/apis/subscription.ts
import { createGetAll } from "@/lib/apis/factory";
import {
  GetCurrentSubscriptionResType,
  GetPlansQueryType,
  GetPlansResType,
  GetSubscriptionUsageQueryType,
  GetSubscriptionUsageResType,
} from "@/models/subscriptionPlan.model";

const prefix = "/subscriptions/plans";
// NEW:
const currentPrefix = "/subscriptions/current";
const usagePrefix = "/subscriptions/usage";

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
};

export default subscriptionApiRequest;
