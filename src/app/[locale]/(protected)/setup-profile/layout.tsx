interface SetupProfileLayoutProps {
  children: React.ReactNode;
}

export default function SetupProfileLayout({
  children,
}: SetupProfileLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      {children}
    </div>
  );
}
