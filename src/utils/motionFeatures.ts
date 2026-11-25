export const loadMotionFeatures = () =>
  import("framer-motion").then((mod) => mod.domAnimation);
