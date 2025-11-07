export const MessageEnum = {
  Text: "Text",
  Image: "Image",
  Images: "Images",
} as const;

export const MESSAGE_IMAGE_SEPARATOR = "<<~IMG~>>"; // Must match BE: CoreHelper.ImageSeparator

export type TypeOfMessageEnumType =
  (typeof MessageEnum)[keyof typeof MessageEnum];
