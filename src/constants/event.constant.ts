export const EventStatus = {
  Pending: "Pending",
  Approved: "Approved",
  Rejected: "Rejected",
  Live: "Live",
  Cancelled: "Cancelled",
  Completed: "Completed",
} as const;

export type EventStatusType = (typeof EventStatus)[keyof typeof EventStatus];

export const EventRole = {
  Host: "Host",
  Attendee: "Attendee",
} as const;

export type EventRoleType = (typeof EventRole)[keyof typeof EventRole];
