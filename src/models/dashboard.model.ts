import z from "zod";

/* ========= Common ========= */

export const TrendGranularitySchema = z.enum(["daily", "weekly", "monthly"]);

export type TrendGranularity = z.infer<typeof TrendGranularitySchema>;

const DateRangeSchema = z.object({
  start: z.iso.datetime(),
  end: z.iso.datetime(),
  label: z.string(),
});

/* ========= Revenue ========= */

export const RevenueTrendPointSchema = DateRangeSchema.extend({
  amount: z.number(),
});

export type RevenueTrendPointType = z.infer<typeof RevenueTrendPointSchema>;

export const DashboardRevenueSchema = z.object({
  totalRevenue: z.number(),
  revenueInRange: z.number(),
  revenueToday: z.number(),
  revenueThisWeek: z.number(),
  revenueThisMonth: z.number(),
  revenueThisYear: z.number(),

  // BE mới
  trendGranularity: TrendGranularitySchema,
  trend: z.array(RevenueTrendPointSchema),
});

/* ========= Users ========= */

export const NewUsersTrendPointSchema = DateRangeSchema.extend({
  count: z.number(),
});

export type NewUsersTrendPointType = z.infer<typeof NewUsersTrendPointSchema>;

export const DashboardUsersSchema = z.object({
  totalUsers: z.number(),
  newUsersInRange: z.number(),
  activeUsersLast7Days: z.number(),

  // BE mới
  newUsersGranularity: TrendGranularitySchema,
  newUsersTrend: z.array(NewUsersTrendPointSchema),
});

/* ========= Events ========= */

export const NewEventsTrendPointSchema = DateRangeSchema.extend({
  count: z.number(),
});

export type NewEventsTrendPointType = z.infer<typeof NewEventsTrendPointSchema>;

export const DashboardEventsSchema = z.object({
  totalEvents: z.number(),
  newEventsInRange: z.number(),
  upcomingEvents: z.number(),
  completedEvents: z.number(),
  totalRegistrations: z.number(),

  // BE mới
  newEventsGranularity: TrendGranularitySchema,
  newEventsTrend: z.array(NewEventsTrendPointSchema),
});

/* ========= Subscriptions ========= */

export const MostUsedPlusPlanSchema = z.object({
  subscriptionId: z.string(),
  name: z.string(),
  price: z.number(),
  durationInDays: z.number(),
  activeUsers: z.number(),
});

export type MostUsedPlusPlanType = z.infer<typeof MostUsedPlusPlanSchema>;

export const DashboardSubscriptionsSchema = z.object({
  activeSubscriptions: z.number(),
  newSubscriptionsInRange: z.number(),
  planBreakdown: z.record(z.string(), z.number()), // { "Free": 5, "Plus": 9, ... }

  // BE mới
  mostUsedPlusPlan: MostUsedPlusPlanSchema.optional(),
});

/* ========= Social ========= */

export const DashboardSocialSchema = z.object({
  totalPosts: z.number(),
  postsInRange: z.number(),
});

/* ========= Reports ========= */

export const DashboardReportsSchema = z.object({
  totalReports: z.number(),
  pendingReports: z.number(),
  reportsInRange: z.number(),
});

/* ========= WordSets ========= */

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
