export const MessageEnum = {
  Text: "Text",
  Image: "Image",
  Images: "Images",
  Audio: "Audio",
  VoiceCall: "VoiceCall",
  VideoCall: "VideoCall",
} as const;

export const MessageTypeNumber = {
  Text: 0,
  Image: 1,
  Images: 2,
  Audio: 3,
  VoiceCall: 4,
  VideoCall: 5,
} as const;

export const CallStatusEnum = {
  Completed: "Completed",
  Missed: "Missed",
  Declined: "Declined",
  Failed: "Failed",
  Cancelled: "Cancelled",
} as const;

export const MESSAGE_IMAGE_SEPARATOR = "<<~IMG~>>"; // Must match BE: CoreHelper.ImageSeparator

export type TypeOfMessageEnumType =
  (typeof MessageEnum)[keyof typeof MessageEnum];

export type MessageTypeValue =
  | (typeof MessageEnum)[keyof typeof MessageEnum]
  | (typeof MessageTypeNumber)[keyof typeof MessageTypeNumber];
