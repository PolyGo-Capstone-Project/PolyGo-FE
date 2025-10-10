import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Manage Gifts - PolyGo",
  description: "Manage user gifts and settings",
};

export default function ManageGiftsPage() {
  return (
    <>
      <ComingSoon
        title="Gift Management"
        description="We're building an amazing gift management system. Check back soon!"
      />
    </>
  );
}
