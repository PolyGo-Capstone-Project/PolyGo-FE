interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  // Different layout for protected pages (e.g., dashboard, admin)
  // No Header/Footer - maybe sidebar instead
  return (
    <div className="min-h-screen bg-background">
      {/* TODO: Add Sidebar or Dashboard Layout here */}
      {children}
    </div>
  );
}
