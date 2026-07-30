import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppHeader, BottomNav, SideNav } from "../components/ui";
import InstallPrompt from "../components/InstallPrompt";

export default function AppLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-offwhite">
      <AppHeader />
      <div className="mx-auto flex max-w-5xl gap-8 px-4 pb-28 pt-5 md:pb-12">
        <SideNav />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
