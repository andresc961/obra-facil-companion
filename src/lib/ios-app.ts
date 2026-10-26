import { useEffect, useState } from "react";

type CapacitorWindow = Window & { Capacitor?: { isNativePlatform?: () => boolean } };

/** Call from effects or user actions, never during SSR or render. */
export function isIosNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const queryFlag = new URLSearchParams(window.location.search).get("ios") === "1";
  let storedFlag = false;
  try {
    if (queryFlag) window.sessionStorage.setItem("obrafacil-ios", "1");
    storedFlag = window.sessionStorage.getItem("obrafacil-ios") === "1";
  } catch { /* Private browsing can disable storage; direct signals still work. */ }
  return queryFlag || storedFlag || navigator.userAgent.includes("ObraFacilIOS")
    || !!(window as CapacitorWindow).Capacitor?.isNativePlatform?.();
}

export function useIsIosNativeApp(): boolean {
  const [native, setNative] = useState(false);
  useEffect(() => { setNative(isIosNativeApp()); }, []);
  return native;
}