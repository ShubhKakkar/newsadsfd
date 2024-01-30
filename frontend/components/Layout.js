import Footer from "./Footer";
import Header from "./Header";
import Seo from "./Seo";

const Layout = ({ children, seoData = {} }) => {
  return (
    <div>
      <Seo seoData={seoData} />
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
