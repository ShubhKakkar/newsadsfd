import Link from "next/link";
import { useSelector } from "react-redux";
import useTranslate from "../hooks/useTranslate";

const Footer = () => {
  const t = useTranslate();
  const { socialSettings, appLinks, loggedIn, categories } = useSelector(
    (state) => state.auth
  );

  const SocialObj = {
    Facebook: <i className="fab fa-facebook-f" />,
    Twitter: <i className="fab fa-twitter" />,
    LinkedIn: <i className="fab fa-linkedin-in" />,
  };

  const playStore = appLinks.find((a) => a.title === "Play Store Link")?.value;
  const appStore = appLinks.find((a) => a.title === "App Store Link")?.value;

  return (
    <>
      <footer className="footer_wrapper">
        <div className="footerBg">
          <div className="container">
            <div className="FTopRow">
              <div className="footer-Logo">
                <figure>
                  <img src="/assets/img/logo.png" alt="" />
                </figure>
              </div>
              <div className="appBlock">
                <div className="play_btns">
                  <a
                    href={appStore}
                    target="_blank"
                    className="google_play_btn apps_store_btn"
                  >
                    <span>
                      <i className="fab fa-apple" />
                    </span>
                    <p>
                      <small> Download on the</small> App Store
                    </p>
                  </a>
                  <a
                    href={playStore}
                    target="_blank"
                    className="google_play_btn"
                  >
                    <span>
                      <img src="/assets/img/play-store.png" alt="" />
                    </span>
                    <p>
                      <small> GET IT ON</small> Google Play
                    </p>
                  </a>
                </div>
              </div>
            </div>
            <div className="footerMenu">
              <div className="fopterrow">
                {categories.map((category) => (
                  <div key={category._id} className="custom-col-7 footerCol1">
                    <h6>{category.name}</h6>
                    <ul className="footer-links">
                      {category.subCategories
                        .filter((_, idx) => idx <= 6)
                        .map((sc) => (
                          <li key={sc._id}>
                            <Link
                              // href={`/category/${category.slug}/sub-category/${sc.slug}`}
                              href={`/category/${sc.slug}`}
                              legacyBehavior
                            >
                              <a>{sc.name}</a>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}

                <div className="custom-col-7 footerCol5">
                  <h6>{t("COMPANY")}</h6>
                  <ul className="footer-links">
                    <li>
                      <Link href="/help-&-support" legacyBehavior>
                        <a>{t("Help & Support")}</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/faqs" legacyBehavior>
                        <a>{t("FAQs")}</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy-policy" legacyBehavior>
                        <a>{t("Privacy Policy")}</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms-&-conditions" legacyBehavior>
                        <a>{t("Terms & Conditions")}</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/refund-policy" legacyBehavior>
                        <a>{t("Refund Policy")}</a>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="custom-col-7 footerCol6">
                  <h6>{t("CONTACT US")}</h6>
                  <ul className="footer-links">
                    {!loggedIn && (
                      <li>
                        <Link href="/vendor/signup" legacyBehavior>
                          <a>{t("Become a Vendor")}</a>
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link href="/contact-us" legacyBehavior>
                        <a>{t("Contact Us")}</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/cancellation-policy" legacyBehavior>
                        <a>{t("Cancellation Policy")}</a>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="custom-col-7 footerCol7">
                  <h6>{t("SOCIAL")}</h6>
                  <ul className="footer-links FootSocialLinks">
                    {socialSettings.map((data) => (
                      <li key={data._id}>
                        <a href={data.value} target="_blank">
                          <span className="FootSocialicn">
                            {SocialObj[data.title]}
                          </span>
                          {t(data.title)}
                        </a>
                      </li>
                    ))}
                    {/* <li>
                    <a href="#">
                      <span className="FootSocialicn">
                        <i className="fab fa-facebook-f" />
                      </span>
                      Facebook
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <span className="FootSocialicn">
                        <i className="fab fa-twitter" />
                      </span>
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <span className="FootSocialicn">
                        <i className="fab fa-linkedin-in" />
                      </span>
                      Linkedin
                    </a>
                  </li> */}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="copyright">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-sm-12">
                <span> {t("© 2023 Designed By NoonMAR")} </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <a
        onClick={() => {
          $("html, body").animate({ scrollTop: 0 }, "300");
        }}
        href="javascript:void(0)"
        id="top-button"
        className="back_top"
      >
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 25 25"
            fill="none"
          >
            <mask
              id="mask0_511_55"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={25}
              height={25}
            >
              <rect
                x="0.5"
                y="0.25"
                width={24}
                height={24}
                fill="currentColor"
              />
            </mask>
            <g mask="url(#mask0_511_55)">
              <path
                d="M11.5 22.25V6.075L6.9 10.65L5.5 9.25L12.5 2.25L19.5 9.25L18.1 10.675L13.5 6.075V22.25H11.5Z"
                fill="currentColor"
              />
            </g>
          </svg>
        </span>
      </a>
    </>
  );
};

export default Footer;
