import type { NextPageContext } from "next";
import Head from "next/head";
import { ErrorState } from "../site/components/semantic-components";

export default function ErrorPage({ statusCode }: { statusCode: number }) {
  return <><Head><title>Page unavailable</title><meta name="robots" content="noindex,nofollow" /></Head><main id="main-content" className="neutral-system-shell"><div className="container system-page"><ErrorState title="Page unavailable" body={statusCode ? `The request could not be completed (${statusCode}).` : "The page could not be rendered."} /></div></main></>;
}
ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => ({ statusCode: res?.statusCode ?? err?.statusCode ?? 500 });
