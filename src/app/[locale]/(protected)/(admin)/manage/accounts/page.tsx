import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Accounts | PolyGo",
  description: "Manage user accounts and settings",
};

export default function ManageAccountPage() {
  return (
    <>
      <div>
        <h1>Manage Accounts Page - Admin Only</h1>
      </div>
    </>
  );
}
