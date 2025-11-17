export const ReactionEnum = {
  Like: "Like",
  Love: "Love",
  Haha: "Haha",
  Wow: "Wow",
  Sad: "Sad",
  Angry: "Angry",
} as const;

export type ReactionEnumType = (typeof ReactionEnum)[keyof typeof ReactionEnum];
