import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { lock, isUnlocked } from "@/lib/pin";

const IDLE_MS = 5 * 60 * 1000;

export function useAutoLock() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    let timer: number | undefined;

    const reset = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (isUnlocked()) {
          lock();
          navigate({ to: "/unlock" });
        }
      }, IDLE_MS);
    };

    const events = ["mousemove", "keydown", "touchstart", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      if (timer) window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [navigate]);
}
