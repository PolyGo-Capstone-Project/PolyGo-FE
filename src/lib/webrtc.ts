export class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private iceServers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  constructor(
    private onRemoteStream: (peerId: string, stream: MediaStream) => void,
    private onIceCandidate: (peerId: string, candidate: RTCIceCandidate) => void
  ) {}

  setLocalStream(stream: MediaStream) {
    this.localStream = stream;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    if (this.peerConnections.has(peerId)) {
      return this.peerConnections.get(peerId)!;
    }

    const pc = new RTCPeerConnection({
      iceServers: this.iceServers,
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidate(peerId, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onRemoteStream(peerId, event.streams[0]);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE state for ${peerId}:`, pc.iceConnectionState);
      if (
        pc.iceConnectionState === "failed" ||
        pc.iceConnectionState === "disconnected"
      ) {
        console.warn(`Connection issue with peer ${peerId}`);
      }
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream) {
          pc.addTrack(track, this.localStream);
        }
      });
    }

    this.peerConnections.set(peerId, pc);
    return pc;
  }

  async createOffer(peerId: string): Promise<string> {
    const pc = await this.createPeerConnection(peerId);
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await pc.setLocalDescription(offer);
    return offer.sdp!;
  }

  async handleOffer(peerId: string, sdp: string): Promise<string> {
    const pc = await this.createPeerConnection(peerId);
    await pc.setRemoteDescription({ type: "offer", sdp });
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer.sdp!;
  }

  async handleAnswer(peerId: string, sdp: string): Promise<void> {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      await pc.setRemoteDescription({ type: "answer", sdp });
    }
  }

  async addIceCandidate(
    peerId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    const pc = await this.createPeerConnection(peerId);
    try {
      await pc.addIceCandidate(candidate);
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }

  closePeerConnection(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }
  }

  closeAll() {
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  replaceVideoTrack(newTrack: MediaStreamTrack) {
    this.peerConnections.forEach((pc) => {
      const sender = pc
        .getSenders()
        .find((s) => s.track?.kind === newTrack.kind);
      if (sender) {
        sender.replaceTrack(newTrack);
      }
    });
  }
}
