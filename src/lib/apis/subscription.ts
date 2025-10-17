// src/lib/apis/subscription.ts
import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";

import {
  // Plans & Current/Usage types (từ file dưới - đã gộp vào models chung)
  CancelSubscriptionResType,
  // Admin types (từ file trên)
  CreateSubscriptionBodyType,
  GetCurrentSubscriptionResType,
  GetPlansQueryType,
  GetPlansResType,
  GetSubscriptionByIdQueryType,
  GetSubscriptionByIdResType,
  GetSubscriptionsQueryType,
  GetSubscriptionsResType,
  GetSubscriptionUsageQueryType,
  GetSubscriptionUsageResType,
  MessageResType,
  SubscribeBodyType,
  SubscribeResType,
  UpdateAutoRenewResType,
  UpdateSubscriptionBodyType,
} from "@/models";

/** =========================
 *  PREFIXES
 *  ========================= */
const adminPrefix = "/subscriptions"; // Admin CRUD
const plansPrefix = "/subscriptions/plans"; // Public list plans
const currentPrefix = "/subscriptions/current"; // Current subscription
const usagePrefix = "/subscriptions/usage"; // Usage
const autoRenewPrefix = "/subscriptions/auto-renew";
const cancelPrefix = "/subscriptions/cancel";
const subscribePrefix = "/subscriptions/subscribe";

/** =========================
 *  TYPES (re-export aliases)
 *  ========================= */
export type GetSubscriptionsParams = GetSubscriptionsQueryType;
export type GetSubscriptionParams = GetSubscriptionByIdQueryType;

export type GetPlansParams = GetPlansQueryType;
export type GetSubscriptionUsageParams = GetSubscriptionUsageQueryType;

/** =========================
 *  ADMIN API (GIỮ NGUYÊN) - DEFAULT EXPORT
 *  ========================= */
const subscriptionAdminApiRequest = {
  // Admin Subscriptions
  getAll: createGetAll<GetSubscriptionsResType, GetSubscriptionsParams>(
    adminPrefix
  ),
  getOne: createGetOne<GetSubscriptionByIdResType, GetSubscriptionParams>(
    adminPrefix
  ),
  create: (body: CreateSubscriptionBodyType) =>
    http.post<MessageResType>(`${adminPrefix}`, body),
  update: (id: string, body: UpdateSubscriptionBodyType) =>
    http.put<MessageResType>(`${adminPrefix}/${id}`, body),
  delete: (id: string) => http.delete<MessageResType>(`${adminPrefix}/${id}`),
};

/** =========================
 *  PUBLIC / CUSTOMER-FACING API (GIỮ NGUYÊN)
 *  Named export: subscriptionPlansApiRequest
 *  ========================= */
export const subscriptionPlansApiRequest = {
  // Plans
  getAll: createGetAll<GetPlansResType, GetPlansParams>(plansPrefix),
  // (optional) getOne: createGetOne<GetPlanByIdResType, GetPlanByIdQueryType>(plansPrefix),

  // Current subscription
  getCurrent: createGetAll<GetCurrentSubscriptionResType>(currentPrefix),

  // Usage of current subscription
  getUsage: createGetAll<
    GetSubscriptionUsageResType,
    GetSubscriptionUsageParams
  >(usagePrefix),

  // Toggle auto-renew
  toggleAutoRenew: (autoRenew: boolean) =>
    http.put<UpdateAutoRenewResType>(
      `${autoRenewPrefix}?autoRenew=${autoRenew}`,
      null
    ),

  // Cancel current subscription
  cancelCurrent: (reason: string) =>
    http.post<CancelSubscriptionResType>(cancelPrefix, { reason }),

  // Subscribe to a plan
  subscribe: (body: SubscribeBodyType) =>
    http.post<SubscribeResType>(subscribePrefix, body),
};

/** =========================
 *  DEFAULT EXPORT (BACKWARD COMPAT)
 *  ========================= */
const subscriptionApiRequest = subscriptionAdminApiRequest;
export default subscriptionApiRequest;
