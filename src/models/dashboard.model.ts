import z from "zod";

/* ========= Schemas cho từng phần ========= */

export const DashboardRevenueSchema = z.object({
  totalRevenue: z.number(),
  revenueInRange: z.number(),
  revenueToday: z.number(),
  revenueThisWeek: z.number(),
  revenueThisMonth: z.number(),
  revenueThisYear: z.number(),
});

export const DashboardUsersSchema = z.object({
  totalUsers: z.number(),
  newUsersInRange: z.number(),
  activeUsersLast7Days: z.number(),
});

export const DashboardEventsSchema = z.object({
  totalEvents: z.number(),
  newEventsInRange: z.number(),
  upcomingEvents: z.number(),
  completedEvents: z.number(),
  totalRegistrations: z.number(),
});

export const DashboardSubscriptionsSchema = z.object({
  activeSubscriptions: z.number(),
  newSubscriptionsInRange: z.number(),
  planBreakdown: z.record(z.string(), z.number()), // { "Free": 5, "Plus": 9, ... }
});

export const DashboardSocialSchema = z.object({
  totalPosts: z.number(),
  postsInRange: z.number(),
});

export const DashboardReportsSchema = z.object({
  totalReports: z.number(),
  pendingReports: z.number(),
  reportsInRange: z.number(),
});

export const DashboardWordSetsSchema = z.object({
  totalWordSets: z.number(),
  approvedWordSets: z.number(),
  wordSetsInRange: z.number(),
});

/* ========= Tổng quan dashboard ========= */

export const DashboardOverviewDataSchema = z.object({
  rangeStart: z.iso.datetime(),
  rangeEnd: z.iso.datetime(),
  revenue: DashboardRevenueSchema,
  users: DashboardUsersSchema,
  events: DashboardEventsSchema,
  subscriptions: DashboardSubscriptionsSchema,
  social: DashboardSocialSchema,
  reports: DashboardReportsSchema,
  wordSets: DashboardWordSetsSchema,
});

/** Query: from / to dạng string, backend parse date-time */
export const DashboardOverviewQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const DashboardOverviewResSchema = z.object({
  data: DashboardOverviewDataSchema,
  message: z.string(),
});

/* ========= Types ========= */

export type DashboardOverviewDataType = z.infer<
  typeof DashboardOverviewDataSchema
>;
export type DashboardOverviewQueryType = z.infer<
  typeof DashboardOverviewQuerySchema
>;
export type DashboardOverviewResType = z.infer<
  typeof DashboardOverviewResSchema
>;
