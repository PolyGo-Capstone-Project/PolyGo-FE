"use client";

import { useAuthStore } from "@/hooks";

export default function DashboardPage() {
  const role = useAuthStore((state) => state.role);
  return (
    <div>
      <h1>Protected Manage Page</h1>
      <h1>Admin Page</h1>
      <p>Your role: {role}</p>
    </div>
  );
}
