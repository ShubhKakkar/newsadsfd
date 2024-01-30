import Head from "next/head";
import { BASEURL } from "../api";

const Seo = ({ seoData }) => {
  return (
    <Head>
      <title>{seoData?.pageTitle}</title>
      <meta name="description" content={seoData?.metaDescription} />
      <meta name="keywords" content={seoData?.metaKeywords} />
      <meta property="og:title" content={seoData?.ogTitle} />
      <meta property="og:description" content={seoData?.ogDescription} />
      <meta property="og:image" content={`${BASEURL}/${seoData?.ogImage}`} />
      <meta property="og:url" content={seoData?.ogUrl} />
      <meta property="og:type" content={seoData?.ogType} />
      <meta name="twitter:card" content={seoData?.twitterCard} />
      <meta name="twitter:site" content={seoData?.twitterSite} />
    </Head>
  );
};

export default Seo;
