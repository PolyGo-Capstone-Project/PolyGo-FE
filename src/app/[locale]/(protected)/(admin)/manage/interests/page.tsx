import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Manage Interests - PolyGo",
  description: "Manage user interests and settings",
};

export default function ManageInterestsPage() {
  return (
    <>
      <ComingSoon
        title="Interest Management"
        description="We're building an amazing interest management system. Check back soon!"
      />
    </>
  );
}
