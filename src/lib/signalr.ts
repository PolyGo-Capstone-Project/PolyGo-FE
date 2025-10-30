import * as signalR from "@microsoft/signalr";

class SignalRClient {
  private connection: signalR.HubConnection | null = null;
  private static instance: SignalRClient;

  private constructor() {}

  static getInstance(): SignalRClient {
    if (!SignalRClient.instance) {
      SignalRClient.instance = new SignalRClient();
    }
    return SignalRClient.instance;
  }

  async connect(hubUrl: string): Promise<signalR.HubConnection> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return this.connection;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log("SignalR Connected");
    } catch (error) {
      console.error("SignalR Connection Error:", error);
      throw error;
    }

    return this.connection;
  }

  getConnection(): signalR.HubConnection | null {
    return this.connection;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("SignalR Disconnected");
      } catch (error) {
        console.error("SignalR Disconnect Error:", error);
      } finally {
        this.connection = null;
      }
    }
  }

  isConnected(): boolean {
    return (
      this.connection?.state === signalR.HubConnectionState.Connected || false
    );
  }
}

export default SignalRClient.getInstance();
