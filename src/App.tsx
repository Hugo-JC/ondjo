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
  if (propertyMatch) {
    return <AppShell><PropertyPage id={propertyMatch[1]} /></AppShell>;
  }
  if (hash.startsWith("#/pesquisar")) {
    return <AppShell><SearchPage /></AppShell>;
  }
  return <AppShell><Home /></AppShell>;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem("ondjo-sidebar-expanded") === "true",
  );

  useEffect(() => {
    window.localStorage.setItem("ondjo-sidebar-expanded", String(sidebarExpanded));
  }, [sidebarExpanded]);

  return (
    <div className="min-h-screen bg-ondjo-bg">
      <Sidebar expanded={sidebarExpanded} onExpandedChange={setSidebarExpanded} />
      <div className={[
        "min-w-0 transition-[padding] duration-200 ease-out motion-reduce:transition-none",
        sidebarExpanded ? "lg:pl-64" : "lg:pl-20",
      ].join(" ")}>
        <Header />
        {children}
      </div>
    </div>
  );
}
