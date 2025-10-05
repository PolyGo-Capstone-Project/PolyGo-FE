import { Footer, Header } from "@/components";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4 py-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
