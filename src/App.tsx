import { lazy, Suspense, useEffect, useState } from "react";
import { LazyMotion, MotionConfig } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { Home } from "./pages/Home";
import { useHashRoute } from "./hooks/useHashRoute";
import { loadMotionFeatures } from "./utils/motionFeatures";
import {
  PropertyPageSkeleton,
  SearchPageSkeleton,
  Skeleton,
} from "./components/ui/ondjo-skeletons";
import { TooltipProvider } from "./components/ui/tooltip";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const SearchPage = lazy(() =>
  import("./pages/SearchPage").then((m) => ({ default: m.SearchPage })),
);
const PropertyPage = lazy(() =>
  import("./pages/PropertyPage").then((m) => ({ default: m.PropertyPage })),
);
const FavoritesPage = lazy(() =>
  import("./pages/FavoritesPage").then((m) => ({ default: m.FavoritesPage })),
);
const ChatPage = lazy(() =>
  import("./pages/ChatPage").then((m) => ({ default: m.ChatPage })),
);
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

function PageFallback() {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="A carregar página"
    >
      <Skeleton className="h-7 w-48 rounded-xl" />
      <Skeleton className="h-44 w-full rounded-3xl" />
    </div>
  );
}

export default function App() {
  const route = useHashRoute();

  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user">
          <TooltipProvider delay={180}>
            {route.page === "login" ? (
            <Suspense fallback={<PageFallback />}>
              <LoginPage />
            </Suspense>
          ) : route.page === "register" ? (
            <Suspense fallback={<PageFallback />}>
              <RegisterPage />
            </Suspense>
          ) : route.page === "property" ? (
            <AppShell>
              <Suspense fallback={<PropertyPageSkeleton />}>
                <PropertyPage id={route.id} />
              </Suspense>
            </AppShell>
          ) : route.page === "search" ? (
            <AppShell>
              <Suspense fallback={<SearchPageSkeleton />}>
                <SearchPage />
              </Suspense>
            </AppShell>
          ) : route.page === "favorites" ? (
            <AppShell>
              <Suspense fallback={<PageFallback />}>
                <FavoritesPage />
              </Suspense>
            </AppShell>
          ) : route.page === "chat" ? (
            <AppShell fixedContent>
              <Suspense fallback={<PageFallback />}>
                <ChatPage />
              </Suspense>
            </AppShell>
          ) : (
            <AppShell>
              <Home />
            </AppShell>
            )}
          </TooltipProvider>
        </MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
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
          ? "h-dvh w-full max-w-full overflow-hidden bg-ondjo-bg flex flex-col pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
          : "min-h-dvh w-full max-w-full overflow-x-clip bg-ondjo-bg flex flex-col pb-24 lg:pb-0"
      }
    >
      <Sidebar expanded={sidebarExpanded} onExpandedChange={setSidebarExpanded} />
      <div
        className={[
          "flex-1 flex flex-col min-w-0",
          sidebarExpanded ? "lg:pl-64" : "lg:pl-20",
          fixedContent ? "flex-1 min-h-0 overflow-hidden" : "",
        ].join(" ")}
      >
        <Header />
        <div
          className={
            fixedContent ? "flex-1 min-h-0 flex flex-col overflow-hidden" : "flex-1 min-w-0"
          }
        >
          {children}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
