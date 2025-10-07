import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | PolyGo",
  description: "User dashboard with account information and settings",
};

export default function DashboardPage() {
  return (
    <>
      <div>
        <h1>Dashboard Page - User Only</h1>
      </div>
    </>
  );
}
