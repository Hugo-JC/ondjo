import { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { Home } from "./pages/Home";
import { SearchPage } from "./pages/SearchPage";
import { PropertyPage } from "./pages/PropertyPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
function useRoute() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return hash;
}
export default function App() {
  const hash = useRoute();
  if (hash.startsWith("#/login")) return <LoginPage />;
  if (hash.startsWith("#/cadastro")) return <RegisterPage />;
  const propertyMatch = hash.match(/^#\/imovel\/([^?]+)/);
  if (propertyMatch)
    return (
      <AppShell>
        <PropertyPage id={propertyMatch[1]} />
      </AppShell>
    );
  if (hash.startsWith("#/pesquisar"))
    return (
      <AppShell>
        <SearchPage />
      </AppShell>
    );
  return (
    <AppShell>
      <Home />
    </AppShell>
  );
}
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="min-w-0 lg:pl-18">
        <Header />
        {children}
      </div>
    </div>
  );
}
