import Head from "next/head";
import { SystemMessageView } from "../site/components/semantic-components";
export default function StaticNotFound() { return <><Head><title>Page not found</title><meta name="robots" content="noindex,nofollow" /></Head><main id="main-content" className="neutral-system-shell"><div className="container system-page"><SystemMessageView code={404} title="Page not found" body="The requested page is unavailable." /></div></main></>; }
