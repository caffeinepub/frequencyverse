import { useEffect } from "react";

export default function BackgroundAmbianceCleanup() {
  useEffect(() => {
    try {
      localStorage.removeItem("frequencyverse-background-ambiance");
    } catch (_error) {
      // Silently ignore localStorage errors
    }
  }, []);

  return null;
}
