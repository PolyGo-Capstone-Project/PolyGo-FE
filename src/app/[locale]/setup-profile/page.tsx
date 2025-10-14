import type { Metadata } from "next";

import { SetupProfileForm } from "@/components";

export const metadata: Metadata = {
  title: "Setup Profile - PolyGo",
  description: "Set up your language learning profile",
};

export default function SetupProfilePage() {
  return <SetupProfileForm />;
}
