import EventListPage from "@/app/[locale]/(protected)/(user)/event/event-page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event - PolyGo",
  description: "Event features and interactions",
};

export default function EventPage() {
  return (
    <>
      <EventListPage />
    </>
  );
}
