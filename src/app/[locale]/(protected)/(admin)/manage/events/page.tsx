import ManageEvents from "@/components/modules/admin/events/manage-events";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Events - PolyGo",
  description: "Manage events on the PolyGo platform",
};

export default function ManageEventsPage() {
  return <ManageEvents />;
}
