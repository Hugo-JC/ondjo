import Header from "./components/Header";
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
  return (
    <div
      className={
        fixedContent
          ? "h-dvh overflow-hidden bg-ondjo-bg flex flex-col"
          : "min-h-screen bg-ondjo-bg flex flex-col pb-16 lg:pb-0"
      }
    >
      <Header />
      <div className={fixedContent ? "flex-1 min-h-0 overflow-hidden" : "flex-1"}>
        {children}
      </div>
      <MobileBottomNav />
    </div>
  );
}
