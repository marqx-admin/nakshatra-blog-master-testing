import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { Breadcrumbs, PageIntro, StaticInformationBody } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";

export function StaticInformationPage({ data, requestPath }: { data: components["schemas"]["StaticPageData"]; requestPath: string }) {
  const isContact = data.context.page_id === "PUB-STATIC-CONTACT-01";
  return <><SeoHead seo={data.seo} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} contactInfo={isContact ? data.contact_info : undefined} presentation={data.presentation} requestPath={requestPath}>{data.breadcrumbs ? <Breadcrumbs trail={data.breadcrumbs} /> : null}<article className="container page-stack static-page" data-static-key={data.content.static_key} lang={data.site.locale_code ?? data.site.default_language}><PageIntro h1={data.content.title} introText={data.content.intro_text} /><StaticInformationBody content={data.content} showIntro={false} contactInfo={isContact ? data.contact_info ?? { items: [] } : data.contact_info} /></article></SiteShell></>;
}
