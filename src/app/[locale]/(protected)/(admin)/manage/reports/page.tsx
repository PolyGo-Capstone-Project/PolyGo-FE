import type { Metadata } from "next";

import { ComingSoon } from "@/components";

export const metadata: Metadata = {
  title: "Manage Reports - PolyGo",
  description: "Manage reports on the PolyGo platform",
};

export default function Page() {
  return (
    <>
      <ComingSoon
        title="Game Features"
        description="We're building amazing game features. Check back soon!"
      />
    </>
  );
}
