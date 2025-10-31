/**
 * Meeting Room Types
 * For WebRTC video conferencing functionality
 */

export type ParticipantRole = "host" | "attendee";

export type ParticipantStatus = "connecting" | "connected" | "disconnected";

export interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isHandRaised: boolean;
  stream?: MediaStream;
}

export interface MeetingControls {
  audioEnabled: boolean;
  videoEnabled: boolean;
  isHandRaised: boolean;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  isSettingsOpen: boolean;
}

export interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface MeetingSettings {
  selectedAudioInput?: string;
  selectedVideoInput?: string;
  selectedAudioOutput?: string;
}

export interface MeetingChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

export interface WebRTCConnectionConfig {
  iceServers: RTCIceServer[];
}

// SignalR Message Types
export interface SignalRMessage {
  type: string;
  data: any;
}

export interface OfferMessage {
  fromConnId: string;
  sdp: string;
}

export interface AnswerMessage {
  fromConnId: string;
  sdp: string;
}

export interface IceCandidateMessage {
  fromConnId: string;
  candidateJson: string;
}

export interface UserJoinedMessage {
  userName: string;
  role: string;
  connId: string;
}

export interface UserLeftMessage {
  connId: string;
}
