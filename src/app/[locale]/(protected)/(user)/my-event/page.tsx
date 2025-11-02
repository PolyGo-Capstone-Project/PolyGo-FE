import MyEventContent from "@/app/[locale]/(protected)/(user)/my-event/my-event-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Events - PolyGo",
  description: "Manage your events and interactions",
};

export default async function Page() {
  return <MyEventContent />;
}
