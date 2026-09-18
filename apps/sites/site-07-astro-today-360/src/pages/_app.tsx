import type { AppProps } from "next/app";
import { RouteLoadingIndicator } from "../site/components/runtime-states";
import "../site/styles/globals.css";

export default function PublicSiteApp({ Component, pageProps }: AppProps) {
  return <><RouteLoadingIndicator /><Component {...pageProps} /></>;
}
