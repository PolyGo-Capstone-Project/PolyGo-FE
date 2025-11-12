// Export call-related hooks and components
export { CallProvider, useCall } from "@/contexts/call-context";
export { useUserCommunicationHub } from "@/hooks/reusable/use-communication-hub";
export type {
  CallAcceptedData,
  CallDeclinedData,
  CallFailedData,
  IncomingCallData,
  MediaStateUpdate,
} from "@/hooks/reusable/use-communication-hub";
