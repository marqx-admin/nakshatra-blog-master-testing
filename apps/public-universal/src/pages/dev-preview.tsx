import type { GetServerSideProps } from "next";
import Head from "next/head";
import { StandardWebsiteReference } from "../site/reference/standard-website-reference";
import { getDevelopmentPreviewProps, type DevelopmentPreviewProps } from "../site/dev-preview/server";

const templates = [
  ["home", "Home"],
  ["blog", "Blog"],
  ["article", "Article"],
  ["category", "Category"],
  ["tag", "Tag"],
  ["author", "Author"],
  ["search", "Search"],
  ["about", "About"],
  ["contact", "Contact"],
  ["not-found", "404"],
  ["gone", "410"],
] as const;

export const getServerSideProps: GetServerSideProps<DevelopmentPreviewProps> = (context) =>
  getDevelopmentPreviewProps(context);

export default function DevelopmentPreviewPage(props: DevelopmentPreviewProps) {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <aside className="website-preview-notice universal-dev-preview-notice" aria-label="Universal Frontend development preview">
        <div>
          <strong>Development Preview · Synthetic Data</strong>
          <p>This local-only preview is not a real website or tenant. No Public API or database content is used.</p>
        </div>
        <nav className="universal-dev-preview-templates" aria-label="Preview page templates">
          {templates.map(([key, label]) => (
            <a key={key} href={`/dev-preview?page=${key}`} aria-current={props.previewPage === key ? "page" : undefined}>
              {label}
            </a>
          ))}
        </nav>
      </aside>
      <StandardWebsiteReference {...props} />
    </>
  );
}
