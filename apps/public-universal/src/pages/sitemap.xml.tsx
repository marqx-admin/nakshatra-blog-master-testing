import { createCrawlerGetServerSideProps } from "../site/lib/crawler";

export const getServerSideProps = createCrawlerGetServerSideProps("/sitemap.xml");
export default function CrawlerResource() { return null; }
