import Link from "next/link";
import useTranslate from "@/hooks/useTranslate";

const BreadCrumb = ({ values }) => {
  const t = useTranslate();

  const addClassSidebar = () => {
    let ele = document.getElementById("sideMenu");
    let elements = document.getElementsByClassName("dashboardoverlay");

    if (!ele.classList.contains("mobile-show")) {
      // If it doesn't exist, add the class
      ele.classList.add("mobile-show");
      document.body.classList.add("scroll-off");
      document.getElementsByClassName("dashboardoverlay");
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "block";
      }
    } else {
      ele.classList.remove("mobile-show");
      document.body.classList.remove("scroll-off");
    }
    // window.$(".menuoverlay").click(function () {
    //   window.$(this).fadeOut();
    //   window.$("#header .collapse:not(.show)").toggleClass("menu-show");
    //   window.$("body").toggleClass("scroll-off");
    //   window.$(".navbar-toggler").toggleClass("menu-opened");
    //   // $(".overlay").fadeToggle();
    // });
    // $(".dashboardoverlay").click(function () {
    //   window.$(this).fadeToggle();
    //   window.$("body").removeClass("scroll-off");
    //   window.$(".dashboardSideBar").removeClass("mobile-show");
    // });

    // $(".menu-toggle").click(function () {
    //   window.$(".dashboardSideBar").addClass("mobile-show");
    //   window.$("body").toggleClass("scroll-off");
    //   window.$(".dashboardoverlay").fadeToggle();
    // });
    // $(".dashboard-nav-list a").click(function () {
    //   window.$("body").toggleClass("scroll-off");
    //   window.$(".dashboardoverlay").hide();
    //   window.$(".dashboardSideBar").removeClass("mobile-show");
    // });
  };

  const closeClassSidebar = () => {
    let elements = document.getElementsByClassName("dashboardoverlay");
    let ele = document.getElementById("sideMenu");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display = "none";
    }
    ele.classList.remove("mobile-show");
    document.body.classList.remove("scroll-off");
  };

  return (
    <div className="breadcrumbBlock">
      <div
        className="dashboardoverlay"
        style={{ display: "none" }}
        onClick={() => closeClassSidebar()}
      ></div>

      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" legacyBehavior>
              <a>{t("Home")}</a>
            </Link>
          </li>
          {values &&
            values.map((v, i) => (
              <li
                className="breadcrumb-item active"
                aria-current="page"
                key={i}
              >
                {v}
              </li>
            ))}
        </ol>
      </nav>
      <a href="#!" className="menu-toggle" onClick={() => addClassSidebar()}>
        <i className="fas fa-list-ul" />
      </a>
    </div>
  );
};
export default BreadCrumb;
