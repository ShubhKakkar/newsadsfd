import Link from "next/link";
import useTranslate from "@/hooks/useTranslate";
import NavLink from "../NavLink";
import { useEffect } from "react";

const Sidebar = () => {
  const t = useTranslate();

  useEffect(() => {
    const width = window.innerWidth;
    if (width >= 991) {
      window.$(".theia-sticky").theiaStickySidebar({
        additionalMarginTop: 130,
      });
    }
  }, []);

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
    <div className="col-md-3 col-xl-2 theia-sticky">
      <div className="dashboardSideBar dashboard-nav" id="sideMenu">
        <nav className="dashboard-nav-list">
          <div className="dash-nav-li">
            <NavLink href="/customer/my-profile">
              <Link
                className="dashboard-nav-item scroll updatePassword"
                href="/customer/my-profile"
                onClick={closeClassSidebar}
              >
                {t("My Profile")}
              </Link>
            </NavLink>
          </div>
          <div className="dash-nav-li">
            <a
              className="dashboard-nav-item scroll updatePassword"
              href="my-profile#updatePassword"
            >
              {t("Update Password")}
            </a>
          </div>

          <div className="dash-nav-li">
            <a
              className="dashboard-nav-item scroll addressBook"
              href="my-profile#addressBook"
            >
              {t("My Address Book")}
            </a>
          </div>
       
          {/* <div class='dashboard-nav-dropdown'>
                    <a href="#!" class="dashboard-nav-item dashboard-nav-dropdown-toggle">Notifications</a>
                    <div class='dashboard-nav-dropdown-menu'>
                        <a href="#" class="dashboard-nav-dropdown-item">Submenu 1</a>
                        <a href="#" class="dashboard-nav-dropdown-item">Submenu 2</a>
                        <a href="#" class="dashboard-nav-dropdown-item">Submenu 3</a>
                    </div>
                </div> */}
          <div className="dash-nav-li">
            <a
              className="dashboard-nav-item scroll managePayments"
              href="my-profile#managePayments"
            >
              {t("Manage Payments")}{" "}
            </a>
          </div>
          
          <div className="dash-nav-li">
            <NavLink href="/customer/notifications">
              <Link
                href="/customer/notifications"
                className="dashboard-nav-item scroll Notifications"
                onClick={closeClassSidebar}
              >
                {t("Notifications")}
              </Link>
            </NavLink>
          </div>
          <div className="dash-nav-li">
            <NavLink href="/customer/my-orders">
              <Link
                href="/customer/my-orders"
                className="dashboard-nav-item"
                onClick={closeClassSidebar}
              >
                {t("My Orders")}{" "}
              </Link>
            </NavLink>
          </div>

          <div className="dash-nav-li">
            <NavLink href="/customer/wishlist">
              <Link
                className="dashboard-nav-item scroll updatePassword"
                href="/customer/wishlist"
                onClick={closeClassSidebar}
              >
                {t("My Wishlist")}
              </Link>
            </NavLink>
          </div>

          <div className="dash-nav-li">
            <NavLink href="/customer/saved-for-later">
              <Link
                className="dashboard-nav-item scroll updatePassword"
                href="/customer/saved-for-later"
                onClick={closeClassSidebar}
              >
                {t("Saved For Later")}
              </Link>
            </NavLink>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
