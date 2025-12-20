import {
  EventRole,
  EventStatus,
  PlanTypeEnum,
  UserEventStatus,
} from "@/constants";
import {
  LangQuerySchema,
  PaginationLangQuerySchema,
  PaginationMetaSchema,
} from "@/models/common.model";
import { InterestListItemSchema } from "@/models/interest.model";
import { LanguageListItemSchema } from "@/models/language.model";
import { UserSchema } from "@/models/user.model";
import z from "zod";

export const EventSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  lastUpdatedAt: z.iso.datetime(),

  // 📋 Nội dung & hiển thị
  title: z.string().max(500),
  description: z.string().max(2000),
  bannerUrl: z.string(),
  notesUrl: z.string().optional().nullable(),
  languageId: z.string(),

  // ⚙️ Cấu hình & trạng thái
  status: z.enum(EventStatus),
  planType: z.enum(PlanTypeEnum),
  isPublic: z.boolean().default(true),
  allowLateRegister: z.boolean().default(false),

  // 💰 Quy mô & phí
  capacity: z.number().min(5).max(12),
  fee: z.number().min(0).default(0),

  // 👤 Người liên quan
  hostId: z.string(),

  // 🗓 Thời gian
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime().nullable(),
  registerDeadline: z.iso.datetime(),
  expectedDurationInMinutes: z.number().min(15).max(300).default(15),
});

export const EventInterestsSchema = z.object({
  eventId: z.string(),
  interestIds: z.string(),
});

const hostInfoSchema = UserSchema.pick({
  id: true,
  name: true,
  avatarUrl: true,
});

const participantInfoSchema = UserSchema.pick({
  id: true,
  name: true,
  avatarUrl: true,
}).extend({
  status: z.enum(UserEventStatus),
  role: z.enum(EventRole),
  registeredAt: z.iso.datetime(),
  userEventRatingId: z.string().nullable(),
});

const TargetLanguageSchema = LanguageListItemSchema.omit({
  deletedAt: true,
  createdAt: true,
  lastUpdatedAt: true,
});

const CategoryEventSchema = InterestListItemSchema.omit({
  deletedAt: true,
  createdAt: true,
  lastUpdatedAt: true,
  description: true,
});

const EventListItemSchema = EventSchema.pick({
  id: true,
  title: true,
  description: true,
  status: true,
  startAt: true,
  expectedDurationInMinutes: true,
  registerDeadline: true,
  allowLateRegister: true,
  capacity: true,
  fee: true,
  bannerUrl: true,
  isPublic: true,
  planType: true,
}).extend({
  isParticipant: z.boolean().default(false),
  numberOfParticipants: z.number().min(0).default(0),
  host: hostInfoSchema,
  language: TargetLanguageSchema,
  categories: z.array(CategoryEventSchema).default([]),
});

// Query Parameters and Params ================================================
export const GetEventsQuerySchema = PaginationLangQuerySchema;

export const GetEventByIdQuerySchema = LangQuerySchema;

export const GetEventByHostByIdQuerySchema = LangQuerySchema.extend({
  hostId: z.string(),
});

export const SearchEventsQuerySchema = GetEventsQuerySchema.extend({
  name: z.string().min(1).max(100).optional(),
  isFree: z.boolean().optional(),
  time: z.iso.datetime().optional(),
  languageIds: z.union([z.string(), z.array(z.string())]).optional(),
  interestIds: z.union([z.string(), z.array(z.string())]).optional(),
  status: z.enum(EventStatus).optional(),
});

// METHOD GET ==================================================================

//List event phù hợp với user
export const RecommendedEventResSchema = z.object({
  data: z.object({
    items: z.array(EventListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//List event sắp diễn ra - all user
export const UpcomingEventResSchema = z.object({
  data: z.object({
    items: z.array(EventListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//List event trong quá khứ - admin
export const PastEventResSchema = z.object({
  data: z.object({
    items: z.array(EventListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//List event đã tham gia - user
export const ParticipatedEventResSchema = z.object({
  data: z.object({
    items: z.array(EventListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

//List event đã tạo - host
export const HostedEventResSchema = z.object({
  data: z.object({
    items: z.array(EventListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

// Get event by ID
export const GetEventByIdResSchema = z.object({
  data: EventListItemSchema,
  message: z.string(),
});

const EventReview = z.object({
  id: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional().nullable(),
  createdAt: z.iso.datetime(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional().nullable(),
  }),
});

export const GetEventStatResSchema = z.object({
  data: EventListItemSchema.extend({
    participants: z.array(participantInfoSchema).default([]),
    revenue: z.number().min(0).default(0),
    averageRating: z.number().min(0).max(5).nullable(),
    totalReviews: z.number().min(0).default(0),
    reviews: z.array(EventReview).default([]),
    hostPayoutClaimed: z.boolean().default(false).optional(),
    hostPayoutAmount: z.number().min(0).default(0),
    hostPayoutClaimedAt: z.iso.datetime().nullable(),
  }),
  message: z.string(),
});

// GET event host by Id
export const GetEventHostByIdResSchema = UpcomingEventResSchema;

// METHOD POST =================================================================

// Create event - host
export const CreateEventBodySchema = EventSchema.pick({
  bannerUrl: true,
  notesUrl: true,
  status: true,
  isPublic: true,
  allowLateRegister: true,
  capacity: true,
  fee: true,
  hostId: true,
  expectedDurationInMinutes: true,
})
  .extend({
    title: z.string().min(3).max(500),
    description: z.string().min(10).max(2000),
    languageId: z.string().min(1),
    startAt: z.string().datetime(),
    registerDeadline: z.string().datetime(),
    password: z.string().min(6).max(100).optional().nullable(),
    interestIds: z.array(z.string()).min(1),
    requiredPlanType: z.enum(PlanTypeEnum).default("Free"),
  })
  .strict()
  .refine(
    (data) => {
      if (!data.startAt) return true;
      const startDate = new Date(data.startAt);
      const now = new Date();
      const threeDaysFromNow = new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000
      );
      return startDate >= threeDaysFromNow;
    },
    {
      message: "Events must be created at least 3 days prior to the start date",
      path: ["startAt"],
    }
  )
  .refine(
    (data) => {
      if (!data.startAt) return true;
      const startDate = new Date(data.startAt);
      const now = new Date();
      const threeMonthsFromNow = new Date(
        now.getTime() + 3 * 30 * 24 * 60 * 60 * 1000
      );
      return startDate <= threeMonthsFromNow;
    },
    {
      message:
        "An event cannot be created if its scheduled date is more than 3 months after the creation date",
      path: ["startAt"],
    }
  );

// cancel event - host
export const CancelEventBodySchema = z
  .object({
    eventId: z.string(),
    reason: z.string(),
  })
  .strict();

// register event - user
export const RegisterEventBodySchema = z
  .object({
    eventId: z.string(),
    password: z.string().min(6).max(100).optional().nullable(),
  })
  .strict();

// unregister event - user
export const UnregisterEventBodySchema = z
  .object({
    eventId: z.string(),
    reason: z.string(),
  })
  .strict();

// host kick participant before event
export const KickParticipantBodySchema = z
  .object({
    eventId: z.string(),
    userId: z.string(),
    reason: z.string(),
    allowRejoin: z.boolean().default(true),
  })
  .strict();

// NEW: My rating for an event
export const EventMyRatingResSchema = z.object({
  data: z.object({
    hasRating: z.boolean(),
    id: z.string().optional().nullable(),
    rating: z.number().min(1).max(5).optional().nullable(),
    comment: z.string().optional().nullable(),
    createdAt: z.iso.datetime().optional().nullable(),
  }),
  message: z.string(),
});

// NEW: Rating item của 1 user
export const EventRatingUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().optional().nullable(),
});

export const EventRatingListItemSchema = z.object({
  id: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional().nullable(),
  createdAt: z.iso.datetime(),
  user: EventRatingUserSchema,
});

// NEW: Query cho list ratings (lang + page)
export const EventRatingsQuerySchema = PaginationLangQuerySchema;

// NEW: Response list ratings (có meta phân trang)
export const EventRatingsResSchema = z.object({
  data: z.object({
    items: z.array(EventRatingListItemSchema),
    ...PaginationMetaSchema.shape,
  }),
  message: z.string(),
});

export const UpdateEventRatingBodySchema = z
  .object({
    eventId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().max(2000).optional().nullable(),
  })
  .strict();

export const CreateEventRatingBodySchema = z
  .object({
    eventId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().max(2000).optional().nullable(),
    giftId: z.string().optional().nullable(), // optional
    giftQuantity: z.number().min(0).optional().nullable(), // optional
  })
  .strict();
// METHOD PUT ==================================================================

// Update event - host
export const UpdateEventBodySchema = CreateEventBodySchema.partial();

// Update status - admin apporve/cancel
export const UpdateEventStatusBodySchema = z
  .object({
    eventId: z.string(),
    status: z.enum(EventStatus),
    adminNote: z.string().optional().nullable(),
  })
  .strict();

//types:
export type EventType = z.infer<typeof EventSchema>;
export type EventInterestsType = z.infer<typeof EventInterestsSchema>;
export type GetEventsQueryType = z.infer<typeof GetEventsQuerySchema>;
export type GetEventByIdQueryType = z.infer<typeof GetEventByIdQuerySchema>;
export type GetEventByHostByIdQueryType = z.infer<
  typeof GetEventByHostByIdQuerySchema
>;
export type SearchEventsQueryType = z.infer<typeof SearchEventsQuerySchema>;
export type RecommendedEventResType = z.infer<typeof RecommendedEventResSchema>;
export type UpcomingEventResType = z.infer<typeof UpcomingEventResSchema>;
export type PastEventResType = z.infer<typeof PastEventResSchema>;
export type ParticipatedEventResType = z.infer<
  typeof ParticipatedEventResSchema
>;
export type HostedEventResType = z.infer<typeof HostedEventResSchema>;
export type GetEventByIdResType = z.infer<typeof GetEventByIdResSchema>;
export type GetEventStatResType = z.infer<typeof GetEventStatResSchema>;
export type GetEventHostByIdResType = z.infer<typeof GetEventHostByIdResSchema>;
export type CreateEventBodyType = z.infer<typeof CreateEventBodySchema>;
export type CancelEventBodyType = z.infer<typeof CancelEventBodySchema>;
export type RegisterEventBodyType = z.infer<typeof RegisterEventBodySchema>;
export type UnregisterEventBodyType = z.infer<typeof UnregisterEventBodySchema>;
export type KickParticipantBodyType = z.infer<typeof KickParticipantBodySchema>;
export type UpdateEventBodyType = z.infer<typeof UpdateEventBodySchema>;
export type UpdateEventStatusBodyType = z.infer<
  typeof UpdateEventStatusBodySchema
>;

// NEW types:
export type EventMyRatingResType = z.infer<typeof EventMyRatingResSchema>;
// NEW types
export type EventRatingListItemType = z.infer<typeof EventRatingListItemSchema>;
export type EventRatingsQueryType = z.infer<typeof EventRatingsQuerySchema>;
export type EventRatingsResType = z.infer<typeof EventRatingsResSchema>;
// NEW type
export type UpdateEventRatingBodyType = z.infer<
  typeof UpdateEventRatingBodySchema
>;
export type CreateEventRatingBodyType = z.infer<
  typeof CreateEventRatingBodySchema
>;

// ============== AI SUMMARY SCHEMAS ==============
export const VocabularyItemSchema = z.object({
  word: z.string(),
  meaning: z.string(),
  context: z.string(),
  examples: z.array(z.string()).default([]),
});

export const TranscriptionItemSchema = z.object({
  id: z.string(),
  speakerId: z.string(),
  speakerName: z.string(),
  originalText: z.string(),
  translatedText: z.string().nullable().optional(),
  targetLanguage: z.string().nullable().optional(),
  createdAt: z.iso.datetime(),
});

export const EventSummarySchema = z.object({
  id: z.string().nullable().optional(),
  eventId: z.string(),
  hasSummary: z.boolean(),
  summary: z.string(),
  keyPoints: z.array(z.string()).default([]),
  vocabulary: z.array(VocabularyItemSchema).default([]),
  actionItems: z.array(z.string()).default([]),
  createdAt: z.iso.datetime().nullable().optional(),
});

export const EventSummaryResSchema = z.object({
  data: EventSummarySchema,
  message: z.string(),
});

export const EventTranscriptionsResSchema = z.object({
  data: z.array(TranscriptionItemSchema),
  message: z.string(),
});

export const EventTranscriptionsQuerySchema = z.object({
  pageNumber: z.number().optional().default(1),
  pageSize: z.number().optional().default(100),
});

// AI Summary Types
export type VocabularyItemType = z.infer<typeof VocabularyItemSchema>;
export type TranscriptionItemType = z.infer<typeof TranscriptionItemSchema>;
export type EventSummaryType = z.infer<typeof EventSummarySchema>;
export type EventSummaryResType = z.infer<typeof EventSummaryResSchema>;
export type EventTranscriptionsResType = z.infer<
  typeof EventTranscriptionsResSchema
>;
export type EventTranscriptionsQueryType = z.infer<
  typeof EventTranscriptionsQuerySchema
>;
