export const FriendStatus = {
  None: "None",
  Sent: "Sent",
  Received: "Received",
  Friends: "Friends",
} as const;

export type FriendStatusType = (typeof FriendStatus)[keyof typeof FriendStatus];
