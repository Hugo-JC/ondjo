import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import "./index.css";
import App from "./App";

function ScrollEnhancement() {
  const [shouldEnable, setShouldEnable] = useState(false);

  useEffect(() => {
    // Lenis apenas em desktops (rato/roda), nunca em dispositivos touch/móveis
    // para evitar quebras em 100dvh, pull-to-refresh e headers fixos.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobileWidth = window.innerWidth < 768;

    if (!isTouch && !prefersReducedMotion && !isMobileWidth) {
      setShouldEnable(true);
    }
  }, []);

  if (!shouldEnable) return null;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
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
