import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "My event - PolyGo",
  description: "My event features and interactions",
};

export default function MyEventPage() {
  return (
    <>
      <ComingSoon
        title="My Event Features"
        description="We're building amazing event features. Check back soon!"
      />
    </>
  );
}
