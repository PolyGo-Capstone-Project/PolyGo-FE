import { Footer, Header } from "@/components";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-background via-muted/20 to-background">
        {children}
      </main>
      <Footer />
    </div>
  );
}
