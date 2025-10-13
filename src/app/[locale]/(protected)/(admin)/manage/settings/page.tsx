import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Settings - PolyGo",
  description: "Settings management page",
};

export default function ManageSettingsPage() {
  return (
    <>
      <ComingSoon
        title="Settings Management"
        description="We're building an amazing settings management system. Check back soon!"
      />
    </>
  );
}
