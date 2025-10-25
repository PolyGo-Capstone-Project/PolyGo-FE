import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Game - PolyGo",
  description: "Game features and interactions",
};

export default function ManageGamePage() {
  return (
    <>
      <ComingSoon
        title="Game Features"
        description="We're building amazing game features. Check back soon!"
      />
    </>
  );
}
