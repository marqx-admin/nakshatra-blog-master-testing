import { PublicRoutePage } from "../../../site/pages/router/public-route-page";
import { createPreviewGetServerSideProps } from "../../../site/lib/ssr";

export const getServerSideProps = createPreviewGetServerSideProps();
export default PublicRoutePage;
