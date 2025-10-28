import ManageAccounts from "@/app/[locale]/(protected)/(admin)/manage/accounts/account-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Accounts - PolyGo",
  description: "Manage user accounts on the PolyGo platform",
};

export default function Page() {
  return <ManageAccounts />;
}
