import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
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
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("ondjo-sidebar-expanded") === "true",
  );

  useEffect(() => {
    window.localStorage.setItem(
      "ondjo-sidebar-expanded",
      String(sidebarExpanded),
    );
  }, [sidebarExpanded]);

  return (
    <div
      className={
        fixedContent
          ? "h-dvh overflow-hidden bg-ondjo-bg"
          : "min-h-screen bg-ondjo-bg"
      }
    >
      <Sidebar
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
      />
      <div
        className={[
          "min-w-0 transition-[padding] duration-200 ease-out motion-reduce:transition-none",
          sidebarExpanded ? "lg:pl-64" : "lg:pl-20",
          fixedContent && "flex h-full min-h-0 flex-col overflow-hidden",
        ].join(" ")}
      >
        <Header />
        {children}
      </div>
    </div>
  );
}
