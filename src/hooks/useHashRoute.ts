import { useEffect, useRef, useState } from "react";

export type Route =
  | { page: "home" }
  | { page: "search" }
  | { page: "property"; id: string }
  | { page: "favorites" }
  | { page: "chat"; propertyId?: string }
  | { page: "login" }
  | { page: "register" };

function readRoute(): Route {
  const fullHash = window.location.hash.replace(/^#\/?/, "");
  const [pathPart, queryString] = fullHash.split("?");
  const segments = pathPart ? pathPart.split("/") : [];
  const segment = segments[0] || "";
  const id = segments[1] || "";
  const params = new URLSearchParams(queryString || "");

  if (segment === "imovel" && id) return { page: "property", id };
  if (segment === "pesquisar" || segment === "pesquisa") return { page: "search" };
  if (segment === "favoritos") return { page: "favorites" };
  if (segment === "mensagens" || segment === "chat") {
    const propertyId = params.get("property") || undefined;
    return { page: "chat", propertyId };
  }
  if (segment === "login") return { page: "login" };
  if (segment === "cadastro" || segment === "register") return { page: "register" };

  return { page: "home" };
}

function getRouteKey(route: Route): string {
  return route.page === "property" ? `property:${route.id}` : route.page;
}

export function navigate(path: string) {
  window.location.hash = path.startsWith("#")
    ? path
    : `#/${path.replace(/^\/+/, "")}`;
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(readRoute);
  const lastRouteKeyRef = useRef<string>(getRouteKey(route));

  useEffect(() => {
    const onChange = () => {
      const next = readRoute();
      const nextKey = getRouteKey(next);
      if (nextKey !== lastRouteKeyRef.current) {
        lastRouteKeyRef.current = nextKey;
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
      setRoute(next);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}
