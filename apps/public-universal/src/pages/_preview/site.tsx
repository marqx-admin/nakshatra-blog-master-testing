import { PublicRoutePage } from "../../site/pages/router/public-route-page";
import { createWebsitePreviewGetServerSideProps } from "../../site/lib/ssr";

export const getServerSideProps = createWebsitePreviewGetServerSideProps();
export default PublicRoutePage;
