import type { GetServerSidePropsContext } from "next";
import { createCrawlerGetServerSideProps } from "../../site/lib/crawler";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const name = ctx.params?.resource_name;
  if (typeof name !== "string" || !/^[a-z0-9-]+\.xml$/.test(name)) {
    ctx.res.statusCode = 404;
    ctx.res.setHeader("Cache-Control", "no-store");
    ctx.res.end();
    return { props: {} };
  }
  return createCrawlerGetServerSideProps(`/sitemaps/${name}`)(ctx);
}
export default function CrawlerResource() { return null; }
