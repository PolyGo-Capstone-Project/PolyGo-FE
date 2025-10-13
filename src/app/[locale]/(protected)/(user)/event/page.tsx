import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Event - PolyGo",
  description: "Event features and interactions",
};

export default function EventPage() {
  return (
    <>
      <ComingSoon
        title="Event Features"
        description="We're building amazing event features. Check back soon!"
      />
    </>
  );
}
