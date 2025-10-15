import type { Metadata } from "next";

import MatchingPageContent from "./matching-page-content";

export const metadata: Metadata = {
  title: "Matching - PolyGo",
  description: "Find language partners and make new friends",
};

export default function MatchingPage() {
  return <MatchingPageContent />;
}
