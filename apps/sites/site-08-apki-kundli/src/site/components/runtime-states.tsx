"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export function LoadingState({ label = "Loading page" }: { label?: string | undefined }) {
  return <div className="runtime-loading" role="status" aria-live="polite" aria-busy="true"><span className="loading-indicator" aria-hidden="true" /><span>{label}</span></div>;
}

export function RouteLoadingIndicator() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const start = () => setLoading(true);
    const done = () => setLoading(false);
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", done);
    router.events.on("routeChangeError", done);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", done);
      router.events.off("routeChangeError", done);
    };
  }, [router]);
  return loading ? <div className="route-loading-layer"><LoadingState label="Loading the next page" /></div> : null;
}
