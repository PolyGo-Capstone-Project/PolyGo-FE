import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Events - PolyGo",
  description: "Event features and interactions",
};

export default function ManageEventsPage() {
  return (
    <>
      <ComingSoon
        title="Event Features"
        description="We're building amazing event features. Check back soon!"
      />
    </>
  );
}
