import { resolveStandardDesign } from "@bp/presentation-catalogue";
import { StandardRecipeContext } from "../lib/design-context";
import { resolvedPresentationStyle } from "../lib/presentation";
import type { PublicRouteProps } from "../lib/types";
import { PublicRoutePage } from "../pages/router/public-route-page";

// Nonpublic reference/test entry into the SAME route renderer. It does not fetch,
// create or publish content, register a route, or change any tenant's appearance.
// A registered reference tenant and persisted Standard choice require W2/W3.
export function StandardWebsiteReference(props: PublicRouteProps) {
  const site = props.render.kind === "page" ? props.render.data.site : undefined;
  const locale = site?.locale_code ?? site?.default_language ?? "en";
  return <StandardRecipeContext.Provider value={true}>
    <div data-standard-reference lang={locale} style={resolvedPresentationStyle(resolveStandardDesign(locale))}>
      <PublicRoutePage {...props} />
    </div>
  </StandardRecipeContext.Provider>;
}
