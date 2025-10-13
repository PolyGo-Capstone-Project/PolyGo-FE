import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Dashboard - PolyGo",
  description: "User dashboard with account information and settings",
};

export default function DashboardPage() {
  return (
    <>
      <ComingSoon
        title="Dashboard Features"
        description="We're building amazing dashboard features. Check back soon!"
      />
    </>
  );
}
