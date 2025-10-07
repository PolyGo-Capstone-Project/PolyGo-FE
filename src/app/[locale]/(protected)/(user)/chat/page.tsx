import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat | PolyGo",
  description: "User chat with friends",
};

export default function ChatPage() {
  return (
    <>
      <div>
        <h1>Chat Page - User Only</h1>
      </div>
    </>
  );
}
