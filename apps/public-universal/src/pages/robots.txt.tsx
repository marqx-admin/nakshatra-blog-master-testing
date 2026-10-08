import { createCrawlerGetServerSideProps } from "../site/lib/crawler";

export const getServerSideProps = createCrawlerGetServerSideProps("/robots.txt");
export default function CrawlerResource() { return null; }
