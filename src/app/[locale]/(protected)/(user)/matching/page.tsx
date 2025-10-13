import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Matching - PolyGo",
  description: "Matching features and interactions",
};

export default function MatchingPage() {
  return (
    <>
      <ComingSoon
        title="Matching Features"
        description="We're building amazing matching features. Check back soon!"
      />
    </>
  );
}
