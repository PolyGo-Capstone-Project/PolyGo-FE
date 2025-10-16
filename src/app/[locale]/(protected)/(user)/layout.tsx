import { UserHeader } from "@/components";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader />
      <main>{children}</main>
    </div>
  );
}
