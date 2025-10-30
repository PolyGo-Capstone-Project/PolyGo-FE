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
  Host: "0",
  Attendee: "1",
} as const;

export type EventRoleType = (typeof EventRole)[keyof typeof EventRole];

export const UserEventStatus = {
  Registered: "0",
  Attended: "1",
  Cancelled: "2",
  Kicked: "3",
} as const;

export type UserEventStatusType =
  (typeof UserEventStatus)[keyof typeof UserEventStatus];

export interface Participant {
  id: string;
  name: string;
  role: "Host" | "Participant";
  stream?: MediaStream;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isHandRaised?: boolean;
  raisedHandAt?: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  sentAt: Date;
}

export interface EventRoomConfig {
  eventId: string;
  roomId: string;
  hubUrl: string;
}

export type ViewMode = "grid" | "speaker";
