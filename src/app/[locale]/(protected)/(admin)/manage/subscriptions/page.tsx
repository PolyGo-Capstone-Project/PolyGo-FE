import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Manage Subscriptions - PolyGo",
  description: "Manage user subscriptions and settings",
};

export default function ManageSubscriptionsPage() {
  return (
    <>
      <ComingSoon
        title="Subscriptions Management"
        description="We're building an amazing subscriptions management system. Check back soon!"
      />
    </>
  );
}
