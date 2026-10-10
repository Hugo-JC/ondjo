import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ReactLenis } from "lenis/react";
import "./index.css";
import App from "./App";

function ScrollEnhancement() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () =>
      setPrefersReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  if (prefersReducedMotion) return null;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        allowNestedScroll: true,
      }}
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ScrollEnhancement />
    <App />
  </StrictMode>,
);
