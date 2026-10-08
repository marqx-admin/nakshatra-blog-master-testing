import type { GonePageData, NotFoundPageData } from "../../lib/types";
import { SeoHead } from "../../components/seo-head";
import { RecoveryActions, SystemMessageView } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";

export function SystemPage({ data, requestPath }: { data: NotFoundPageData | GonePageData; requestPath: string }) {
  const content = <div className="container system-page"><SystemMessageView code={data.message.code} title={data.message.title} body={data.message.body} /><RecoveryActions home={data.recovery?.home} search={data.recovery?.search} /></div>;
  if (!data.site || !data.navigation || !data.settings) return <><SeoHead seo={data.seo} /><main id="main-content" className="neutral-system-shell">{content}</main></>;
  return <><SeoHead seo={data.seo} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}>{content}</SiteShell></>;
}
