export const MessageEnum = {
  Text: "Text",
  Image: "Image",
  Images: "Images",
} as const;

export type TypeOfMessageEnumType =
  (typeof MessageEnum)[keyof typeof MessageEnum];
