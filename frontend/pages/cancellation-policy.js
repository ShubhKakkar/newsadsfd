import { useRouter } from "next/router";
import Link from "next/link";

import Layout from "@/components/Layout";
import { getCmsData } from "@/services/cms";
import { createAxiosCookies } from "@/fn";

const CancellationPolicy = ({ cms }) => {
  const router = useRouter();

  //   if (router.isFallback) {
  //     return <div>Loading...</div>;
  //   }

  return (
    <Layout seoData={{ pageTitle: "Cancellation policy - Noonmar" }}>
      <section className="dashboard">
        <div className="container">
          <div className="breadcrumbBlock">
            <nav style={{}} aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/" legacyBehavior>
                    <a>Home</a>
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {cms.title}
                </li>
              </ol>
            </nav>
          </div>
          <div className="cmscontent">
            <div className="cmsContent">
              <div className="row">
                <div
                  className="col-12"
                  dangerouslySetInnerHTML={{ __html: cms?.description }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);
  const cms = await getCmsData("cancellation-policy");

  if (Object.keys(cms).length == 0) {
    return {
      redirect: {
        permanent: false,
        destination: "/404",
      },
    };
  }

  return {
    props: {
      cms,
      protected: null,
    },
  };
}

export default CancellationPolicy;
