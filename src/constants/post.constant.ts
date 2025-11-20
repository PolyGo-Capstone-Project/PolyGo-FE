export const ReactionEnum = {
  Like: "Like",
  Love: "Love",
  Haha: "Haha",
  Wow: "Wow",
  Sad: "Sad",
  Angry: "Angry",
} as const;

export type ReactionEnumType = (typeof ReactionEnum)[keyof typeof ReactionEnum];

export const ShareEnum = {
  Post: "Post",
  Event: "Event",
} as const;

export type ShareEnumType = (typeof ShareEnum)[keyof typeof ShareEnum];
