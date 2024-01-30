import Header from "./Header";
import Sidebar from "./Sidebar";
import Seo from "../Seo";

const Layout = ({ children, seoData = {} }) => {
  return (
    <div className="app">
      <Seo seoData={seoData} />
      <div className="dashBoard_overLay" />
      <div className="layout">
        <Header />
        <Sidebar />
        <div className="page_container">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
