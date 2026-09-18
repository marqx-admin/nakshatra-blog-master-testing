import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { Breadcrumbs, PageIntro, StaticInformationBody } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";

export function StaticInformationPage({ data, requestPath }: { data: components["schemas"]["StaticPageData"]; requestPath: string }) {
  return <><SeoHead seo={data.seo} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} requestPath={requestPath}>{data.breadcrumbs ? <Breadcrumbs trail={data.breadcrumbs} /> : null}<div className="container page-stack static-page"><PageIntro h1={data.content.title} introText={data.content.intro_text} /><StaticInformationBody content={data.content} contactInfo={data.contact_info} /></div></SiteShell></>;
}
