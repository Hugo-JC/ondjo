import { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { Home } from "./pages/Home";
import { SearchPage } from "./pages/SearchPage";
import { PropertyPage } from "./pages/PropertyPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { ChatPage } from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useHashRoute } from "./hooks/useHashRoute";

export default function App() {
  const route = useHashRoute();

  if (route.page === "login") return <LoginPage />;
  if (route.page === "register") return <RegisterPage />;

  if (route.page === "property") {
    return (
      <AppShell>
        <PropertyPage id={route.id} />
      </AppShell>
    );
  }

  if (route.page === "search") {
    return (
      <AppShell>
        <SearchPage />
      </AppShell>
    );
  }

  if (route.page === "favorites") {
    return (
      <AppShell>
        <FavoritesPage />
      </AppShell>
    );
  }

  if (route.page === "chat") {
    return (
      <AppShell fixedContent>
        <ChatPage />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Home />
    </AppShell>
  );
}

function AppShell({
  children,
  fixedContent = false,
}: {
  children: React.ReactNode;
  fixedContent?: boolean;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("ondjo-sidebar-expanded") === "true";
  });

  useEffect(() => {
    window.localStorage.setItem("ondjo-sidebar-expanded", String(sidebarExpanded));
  }, [sidebarExpanded]);

  return (
    <div
      className={
        fixedContent
          ? "h-dvh w-full max-w-full overflow-hidden bg-ondjo-bg flex flex-col"
          : "min-h-dvh w-full max-w-full overflow-x-clip bg-ondjo-bg flex flex-col pb-16 lg:pb-0"
      }
    >
      <Sidebar expanded={sidebarExpanded} onExpandedChange={setSidebarExpanded} />
      <div
        className={[
          "flex-1 flex flex-col min-w-0 transition-[padding] duration-200 ease-out motion-reduce:transition-none",
          sidebarExpanded ? "lg:pl-64" : "lg:pl-20",
          fixedContent ? "h-dvh overflow-hidden" : "",
        ].join(" ")}
      >
        <Header />
        <div
          className={
            fixedContent ? "flex-1 min-h-0 overflow-hidden" : "flex-1 min-w-0"
          }
        >
          {children}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
