import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Chat - PolyGo",
  description: "Chat features and interactions",
};

export default function ChatPage() {
  return (
    <>
      <ComingSoon
        title="Chat Features"
        description="We're building amazing chat features. Check back soon!"
      />
    </>
  );
}
