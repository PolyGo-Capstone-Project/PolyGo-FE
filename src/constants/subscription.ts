export const PlanTypeEnum = {
  FREE: "Free",
  PLUS: "Plus",
  PREMIUM: "Premium",
} as const;

export type PlanTypeEnumType = (typeof PlanTypeEnum)[keyof typeof PlanTypeEnum];

export const FeatureTypeEnum = {
  CHAT: "Chat",
  TRANSLATION: "Translation",
  VOICECALL: "VoiceCall",
  VIDEOCALL: "VideoCall",
  EVENTPARTICIPATION: "EventParticipation",
  EVENTCREATION: "EventCreation",
  PREMIUMBADGES: "PremiumBadges",
  ANALYTICS: "Analytics",
  PRIORITYSUPPORT: "PrioritySupport",
  ADVANCEDMATCHING: "AdvancedMatching",
} as const;

export const LimitTypeEnum = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  UNLIMITED: "Unlimited",
} as const;
