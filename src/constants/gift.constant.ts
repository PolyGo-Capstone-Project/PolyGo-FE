export const GiftVisibilityEnum = {
  Hidden: "Hidden",
  Visible: "Visible",
  Pinned: "Pinned",
} as const;

export type GiftVisibilityEnumType =
  (typeof GiftVisibilityEnum)[keyof typeof GiftVisibilityEnum];
