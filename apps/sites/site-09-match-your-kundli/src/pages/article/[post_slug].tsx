import { PublicRoutePage } from "../../site/pages/router/public-route-page";
import { createPublicGetServerSideProps } from "../../site/lib/ssr";

export const getServerSideProps = createPublicGetServerSideProps(["PUB-ARTICLE-01"]);
export default PublicRoutePage;
