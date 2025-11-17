import type { Metadata } from "next";

import ReportContent from "@/app/[locale]/(protected)/(admin)/manage/reports/report-content";

export const metadata: Metadata = {
  title: "Manage Transactions - PolyGo",
  description: "Manage transactions on the PolyGo platform",
};

export default function Page() {
  return (
    <>
      <ReportContent />
    </>
  );
}
