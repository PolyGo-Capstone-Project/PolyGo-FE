import { UserHeader } from "@/components";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4 py-16">
        {children}
      </main>
    </div>
  );
}
