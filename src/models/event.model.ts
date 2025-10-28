import { EventStatus, PlanTypeEnum } from "@/constants";
import z from "zod";

export const EventSchema = z.object({
  // 🆔 Thông tin định danh & metadata
  id: z.string(),
  createdAt: z.iso.datetime(),
  lastUpdatedAt: z.iso.datetime(),

  // 📋 Nội dung & hiển thị
  title: z.string().max(500),
  description: z.string().max(2000).optional(),
  bannerUrl: z.string().optional().nullable(),
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
  endAt: z.iso.datetime(),
  registerDeadline: z.iso.datetime().optional().nullable(),
  expectedDurationInMinutes: z.number().min(0).default(0),
});

// METHOD GET ==================================================================

//List event sắp diễn ra - all user
export const UpcomingEventResSchema = EventSchema;

//List event trong quá khứ - admin
export const PastEventResSchema = EventSchema;

//List event đã tham gia - user
export const ParticipatedEventResSchema = EventSchema;

//List event đã tạo - host
export const HostedEventResSchema = EventSchema;

// METHOD POST =================================================================

//Create event - host
export const CreateEventBodySchema = EventSchema.pick({
  title: true,
  description: true,
  bannerUrl: true,
  notesUrl: true,
  languageId: true,
  status: true,
  planType: true,
  isPublic: true,
  allowLateRegister: true,
  capacity: true,
  fee: true,
  hostId: true,
  startAt: true,
  endAt: true,
  registerDeadline: true,
  expectedDurationInMinutes: true,
});

// METHOD PUT ==================================================================

// Update event - host
export const UpdateEventBodySchema = CreateEventBodySchema.merge(
  EventSchema.pick({ id: true })
);

//types:
export type EventType = z.infer<typeof EventSchema>;
