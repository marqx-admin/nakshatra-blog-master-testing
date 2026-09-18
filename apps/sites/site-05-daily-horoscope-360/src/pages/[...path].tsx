import { PublicRoutePage } from "../site/pages/router/public-route-page";
import { createPublicGetServerSideProps } from "../site/lib/ssr";

export const getServerSideProps = createPublicGetServerSideProps(undefined);
export default PublicRoutePage;
