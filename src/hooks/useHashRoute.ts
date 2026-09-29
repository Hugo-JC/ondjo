import { useEffect, useState } from "react";

export type Route =
  | { page: "home" }
  | { page: "search" }
  | { page: "property"; id: string };

function readRoute(): Route {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [segment, id] = hash.split("/");

  if (segment === "imovel" && id) return { page: "property", id };
  if (segment === "pesquisar") return { page: "search" };
  return { page: "home" };
}

export function navigate(path: string) {
  window.location.hash = path.startsWith("#")
    ? path
    : `#/${path.replace(/^\/+/, "")}`;
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}
