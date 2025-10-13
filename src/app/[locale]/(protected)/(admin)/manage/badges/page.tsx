import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Manage Badges - PolyGo",
  description: "Manage user badges and settings",
};

export default function ManageBadgesPage() {
  return (
    <>
      <ComingSoon
        title="Badges Management"
        description="We're building an amazing badges management system. Check back soon!"
      />
    </>
  );
}
