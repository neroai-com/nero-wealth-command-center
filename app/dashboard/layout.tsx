import { SidebarNav } from "@/components/sidebar-nav";
import { MobileTopHeader } from "@/components/mobile-top-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <SidebarNav />

      {/* Mobile top header (hidden on desktop) */}
      <MobileTopHeader />

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-x-hidden
        pt-14 lg:pt-0
        pb-20 lg:pb-0"
      >
        {children}
      </main>

      {/* Mobile bottom nav (hidden on desktop) */}
      <MobileBottomNav />
    </div>
  );
}
