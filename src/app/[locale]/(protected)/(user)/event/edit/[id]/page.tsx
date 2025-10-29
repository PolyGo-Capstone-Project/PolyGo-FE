import { EditEventPageContent } from "@/app/[locale]/(protected)/(user)/event/edit/[id]/edit-event-page-content";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditEventPageContent eventId={id} />;
}
