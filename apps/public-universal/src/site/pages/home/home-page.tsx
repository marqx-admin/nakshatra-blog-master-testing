import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { SiteShell } from "../../shell/navigation/site-shell";
import { HomeComposition } from "./home-composition";

type HomeData = components["schemas"]["HomePageData"];

export function HomePage({ data, requestPath }: { data: HomeData; requestPath: string }) {
  return <><SeoHead seo={data.seo} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}><HomeComposition data={data} /></SiteShell></>;
}
