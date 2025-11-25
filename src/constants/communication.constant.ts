export const MessageEnum = {
  Text: "Text",
  Image: "Image",
  Images: "Images",
  Audio: "Audio",
} as const;

export const MessageTypeNumber = {
  Text: 0,
  Image: 1,
  Images: 2,
  Audio: 3,
} as const;

export const MESSAGE_IMAGE_SEPARATOR = "<<~IMG~>>"; // Must match BE: CoreHelper.ImageSeparator

export type TypeOfMessageEnumType =
  (typeof MessageEnum)[keyof typeof MessageEnum];

export type MessageTypeValue =
  | (typeof MessageEnum)[keyof typeof MessageEnum]
  | (typeof MessageTypeNumber)[keyof typeof MessageTypeNumber];
