import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Social - PolyGo",
  description: "Social features and interactions",
};

export default function SocialPage() {
  return (
    <>
      <ComingSoon
        title="Social Features"
        description="We're building amazing social features. Check back soon!"
      />
    </>
  );
}
