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
  capacity: z.number().min(0),
  fee: z.number().min(0).default(0),

  // 👤 Người liên quan
  hostId: z.string(),

  // 🗓 Thời gian
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime().nullable(),
  registerDeadline: z.iso.datetime(),
  expectedDurationInMinutes: z.number().min(0).default(0),
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

export const SearchEventsQuerySchema = GetEventsQuerySchema.extend({
  name: z.string().min(1).max(100).optional(),
  isFree: z.boolean().optional(),
  time: z.iso.datetime().optional(),
  languageIds: z.union([z.string(), z.array(z.string())]).optional(),
  interestIds: z.union([z.string(), z.array(z.string())]).optional(),
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

// Get event detail for host and admin
export const GetEventDetailResSchema = z.object({
  data: EventListItemSchema.extend({
    participants: z.array(participantInfoSchema).default([]),
  }),
  message: z.string(),
});

// METHOD POST =================================================================

//Create event - host
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
    endAt: z.string().datetime().nullable(),
    registerDeadline: z.string().datetime(),
    password: z.string().min(6).max(100).optional().nullable(),
    interestIds: z.array(z.string()).min(1),
    requiredPlanType: z.enum(PlanTypeEnum).default("Free"),
  })
  .strict();

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
export type SearchEventsQueryType = z.infer<typeof SearchEventsQuerySchema>;
export type RecommendedEventResType = z.infer<typeof RecommendedEventResSchema>;
export type UpcomingEventResType = z.infer<typeof UpcomingEventResSchema>;
export type PastEventResType = z.infer<typeof PastEventResSchema>;
export type ParticipatedEventResType = z.infer<
  typeof ParticipatedEventResSchema
>;
export type HostedEventResType = z.infer<typeof HostedEventResSchema>;
export type GetEventByIdResType = z.infer<typeof GetEventByIdResSchema>;
export type GetEventDetailResType = z.infer<typeof GetEventDetailResSchema>;
export type CreateEventBodyType = z.infer<typeof CreateEventBodySchema>;
export type CancelEventBodyType = z.infer<typeof CancelEventBodySchema>;
export type RegisterEventBodyType = z.infer<typeof RegisterEventBodySchema>;
export type UpdateEventBodyType = z.infer<typeof UpdateEventBodySchema>;
export type UpdateEventStatusBodyType = z.infer<
  typeof UpdateEventStatusBodySchema
>;
