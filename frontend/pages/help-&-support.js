import Link from "next/link";

import Layout from "@/components/Layout";

const HelpAndSupport = () => {
  return (
    <Layout seoData={{ pageTitle: "Help & Suppoer - Noonmar" }}>
      {/* help support str*/}
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
                Help &amp; Support
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <section className="help-support">
        <div className="container">
          <div className="col-md-12">
            <div className="helpTop-search">
              <h2 className="SearchTitle">Help &amp; Support</h2>
              <div className="SearchInput-box">
                <div className="form-group form-panl">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ask us Anything"
                  />
                  <button className="topSearch-button" type="button">
                    <svg
                      width={36}
                      height={36}
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M35 35L26.9724 26.9581M31.4211 16.2105C31.4211 20.2446 29.8185 24.1135 26.966 26.966C24.1135 29.8185 20.2446 31.4211 16.2105 31.4211C12.1764 31.4211 8.30759 29.8185 5.45506 26.966C2.60253 24.1135 1 20.2446 1 16.2105C1 12.1764 2.60253 8.30759 5.45506 5.45506C8.30759 2.60253 12.1764 1 16.2105 1C20.2446 1 24.1135 2.60253 26.966 5.45506C29.8185 8.30759 31.4211 12.1764 31.4211 16.2105Z"
                        stroke="#93AAC5"
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* help support ends*/}
      {/* orders str */}
      <section className="userAndHelp_section">
        <div className="container">
          <h3 className="help-section-heading user-section-heading section-heading-noBorder">
            Hi, User, What Can We help you with
          </h3>
          <div className="row g-4">
            <div className="col-lg-2 col-md-4 col-sm-6">
              <a href="#!">
                <div className="user-box user-edit">
                  <div className="user_box_inner">
                    <span className="user_box_icon">
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3 1C1.89543 1 1 1.89545 1 3V17C1 18.1046 1.89543 19 3 19H17C18.1046 19 19 18.1046 19 17V3C19 1.89545 18.1046 1 17 1H3ZM6 11C6 10.4477 5.55228 10 5 10C4.44772 10 4 10.4477 4 11V15C4 15.5523 4.44772 16 5 16C5.55228 16 6 15.5523 6 15V11ZM10 7C10.5523 7 11 7.44769 11 8V15C11 15.5523 10.5523 16 10 16C9.44772 16 9 15.5523 9 15V8C9 7.44769 9.44772 7 10 7ZM16 5C16 4.44769 15.5523 4 15 4C14.4477 4 14 4.44769 14 5V15C14 15.5523 14.4477 16 15 16C15.5523 16 16 15.5523 16 15V5Z"
                          fill="white"
                        />
                      </svg>
                    </span>
                    <h3 className="user_inner_title company-cards">
                      Your Orders
                    </h3>
                    <p className="user_inner_pera">
                      Track Packages edit or cancel
                    </p>
                  </div>
                </div>
              </a>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <a href="#!">
                <div className="user-box refunds-exchange">
                  <div className="user_box_inner">
                    <span className="user_box_icon return-items">
                      <svg
                        width={17}
                        height={20}
                        viewBox="0 0 17 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0 4C0 1.79086 1.79086 0 4 0H10V4C10 6.20914 11.7909 8 14 8H16V16C16 18.2091 14.2091 20 12 20H4C1.79086 20 0 18.2091 0 16V4ZM4 9C3.44772 9 3 9.44772 3 10C3 10.5523 3.44772 11 4 11H6C6.55228 11 7 10.5523 7 10C7 9.44772 6.55228 9 6 9H4ZM4 13C3.44772 13 3 13.4477 3 14C3 14.5523 3.44772 15 4 15H8C8.55228 15 9 14.5523 9 14C9 13.4477 8.55228 13 8 13H4ZM12.6818 2.19879L12.5509 4.16288C12.5106 4.76656 13.0115 5.26743 13.6152 5.22718L15.5792 5.09624C16.4365 5.03909 16.8274 3.99887 16.2198 3.39135L14.3867 1.5582C13.7792 0.950684 12.7389 1.34153 12.6818 2.19879Z"
                          fill="white"
                        />
                      </svg>
                    </span>
                    <h3 className="user_inner_title company-cards">
                      Return &amp; Refunds
                    </h3>
                    <p className="user_inner_pera">Return or exchange items</p>
                  </div>
                </div>
              </a>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <a href="#!">
                <div className="user-box payments-add">
                  <div className="user_box_inner">
                    <span className="user_box_icon menage-add">
                      <svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M16.6261 5.26532L13.3263 5.73673C12.8222 5.80875 12.4103 6.04904 12.1162 6.38114L4.41674 14.0806C3.6357 14.8616 3.63566 16.1279 4.41674 16.909L7.24517 19.7374C8.02625 20.5185 9.29255 20.5185 10.0736 19.7374L17.773 12.038C18.1051 11.7439 18.3454 11.332 18.4174 10.8279L18.8888 7.52803C19.0775 6.20815 17.946 5.07671 16.6261 5.26532ZM14.3162 9.83793C14.7067 10.2284 15.3399 10.2285 15.7305 9.83793C16.121 9.4474 16.1209 8.81421 15.7305 8.42371C15.34 8.03322 14.7068 8.03319 14.3162 8.42372C13.9257 8.81424 13.9257 9.44743 14.3162 9.83793Z"
                          fill="white"
                        />
                      </svg>
                    </span>
                    <h3 className="user_inner_title company-cards">
                      Manage Payments
                    </h3>
                    <p className="user_inner_pera">
                      Add or edit payment Settings
                    </p>
                  </div>
                </div>
              </a>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <a href="#!">
                <div className="user-box personal-information">
                  <div className="user_box_inner">
                    <span className="user_box_icon account-setrings">
                      <svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M14 8C14 10.2091 12.2091 12 10 12C7.79086 12 6 10.2091 6 8C6 5.79086 7.79086 4 10 4C12.2091 4 14 5.79086 14 8ZM10 13C6.13401 13 3 15.2386 3 18C3 19.1046 3.89543 20 5 20H15C16.1046 20 17 19.1046 17 18C17 15.2386 13.866 13 10 13ZM18 6C18.5523 6 19 6.44772 19 7V8H20C20.5523 8 21 8.44772 21 9C21 9.55228 20.5523 10 20 10H19V11C19 11.5523 18.5523 12 18 12C17.4477 12 17 11.5523 17 11V10H16C15.4477 10 15 9.55228 15 9C15 8.44771 15.4477 8 16 8H17V7C17 6.44772 17.4477 6 18 6Z"
                          fill="white"
                        />
                      </svg>
                    </span>
                    <h3 className="user_inner_title company-cards">
                      Account Settings
                    </h3>
                    <p className="user_inner_pera">Personal Information</p>
                  </div>
                </div>
              </a>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <a href="#!">
                <div className="user-box addresses-add">
                  <div className="user_box_inner">
                    <span className="user_box_icon updates-your">
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13.6261 0.265321L10.3263 0.736729C9.82218 0.808749 9.41029 1.04904 9.11617 1.38114L1.41674 9.08057C0.635695 9.86162 0.635663 11.1279 1.41674 11.909L4.24517 14.7374C5.02625 15.5185 6.29255 15.5185 7.0736 14.7374L14.773 7.03799C15.1051 6.74388 15.3454 6.33199 15.4174 5.82786L15.8888 2.52803C16.0775 1.20815 14.946 0.0767079 13.6261 0.265321ZM11.3162 4.83793C11.7067 5.22843 12.3399 5.22846 12.7305 4.83793C13.121 4.4474 13.1209 3.81421 12.7305 3.42371C12.34 3.03322 11.7068 3.03319 11.3162 3.42372C10.9257 3.81424 10.9257 4.44743 11.3162 4.83793Z"
                          fill="white"
                        />
                      </svg>
                    </span>
                    <h3 className="user_inner_title company-cards">
                      Manage Address
                    </h3>
                    <p className="user_inner_pera">
                      Update your addresses Add address
                    </p>
                  </div>
                </div>
              </a>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <a href="#!">
                <div className="user-box Stroefront-plan">
                  <div className="user_box_inner">
                    <span className="user_box_icon plan-manage">
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 6C12 8.20914 10.2091 10 8 10C5.79086 10 4 8.20914 4 6C4 3.79086 5.79086 2 8 2C10.2091 2 12 3.79086 12 6ZM8 11C4.13401 11 1 13.2386 1 16C1 17.1046 1.89543 18 3 18H13C14.1046 18 15 17.1046 15 16C15 13.2386 11.866 11 8 11ZM16 4C16.5523 4 17 4.44772 17 5V6H18C18.5523 6 19 6.44772 19 7C19 7.55228 18.5523 8 18 8H17V9C17 9.55228 16.5523 10 16 10C15.4477 10 15 9.55228 15 9V8H14C13.4477 8 13 7.55228 13 7C13 6.44771 13.4477 6 14 6H15V5C15 4.44772 15.4477 4 16 4Z"
                          fill="white"
                        />
                      </svg>
                    </span>
                    <h3 className="user_inner_title company-cards">
                      Storefront Setting
                    </h3>
                    <p className="user_inner_pera">Manage plan s</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
      {/*orders ends */}
      {/*browse topics str*/}
      <section className="browse-topics">
        <div className="container">
          <h2 className="help-section-heading section-heading-noBorder">
            Browse by Topics
          </h2>
          <div className="browse-topic-box">
            <div className="row">
              <div className="col-lg-3 col-md-6 col-12">
                <ul className="browse-topic-list">
                  <li>
                    <a href="#!">Shippng &amp; Delivery</a>
                  </li>
                  <li>
                    <a href="#!">Payments &amp; pricing</a>
                  </li>
                  <li>
                    <a href="#!">Wellet</a>
                  </li>
                  <li>
                    <a href="#!">Returns, Refunds</a>
                  </li>
                  <li>
                    <a href="#!">ordering</a>
                  </li>
                </ul>
              </div>
              <div className="col-lg-3 col-md-6 col-12">
                <ul className="browse-topic-list">
                  <li>
                    <a href="#!">Managing Your Account</a>
                  </li>
                  <li className="customer-sites">
                    <a href="#!">Devices &amp; Digital Services</a>
                  </li>
                  <li>
                    <a href="#!">Help</a>
                  </li>
                  <li>
                    <a href="#!">Vendor Business</a>
                  </li>
                  <li>
                    <a href="#!">Other Topics &amp; Help Sites</a>
                  </li>
                  <li>
                    <a href="#!">Customer Service</a>
                  </li>
                </ul>
              </div>
              <div className="col-lg-3 col-md-6 col-12">
                <ul className="browse-topic-list">
                  <li>
                    <a href="#!">Managing Your Account</a>
                  </li>
                  <li>
                    <a href="#!">Devices &amp; Digital Services</a>
                  </li>
                  <li>
                    <a href="#!">More Help</a>
                  </li>
                  <li>
                    <a href="#!">Vendor Business</a>
                  </li>
                  <li>
                    <a href="#!">Topics &amp; Help Sites</a>
                  </li>
                  <li>
                    <a href="#!">Customer Service</a>
                  </li>
                </ul>
              </div>
              <div className="col-lg-3 col-md-6 col-12">
                <ul className="browse-topic-list">
                  <li>
                    <a href="#!">Managing Your Account</a>
                  </li>
                  <li>
                    <a href="#!">Devices &amp; Digital Services</a>
                  </li>
                  <li>
                    <a href="#!">More Help</a>
                  </li>
                  <li>
                    <a href="#!">Vendor Business</a>
                  </li>
                  <li>
                    <a href="#!">Other Topics &amp; Help Sites</a>
                  </li>
                  <li>
                    <a href="#!">Customer Service</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*-browse topics ends */}
      {/* Frequently Soultions str*/}
      <section className="fraquently-soultions">
        <div className="container">
          <h2 className="help-section-heading section-heading-noBorder">
            Frequently Soultions
          </h2>
          <div className="row fraquently-row">
            <div className="col-lg-4 col-md-6 col-sm-6">
              <ul className="fraquently-listing">
                <li>
                  <a href="#!">Learn how to...</a>
                </li>
                <li>
                  <a href="#!">Change your Language Prefrence</a>
                </li>
                <li>
                  <a href="#!">Get Started With Noonmar</a>
                </li>
                <li>
                  <a href="#!">Where's My Oroder</a>
                </li>
                <li>
                  <a href="#!">Paying for your Order</a>
                </li>
                <li>
                  <a href="#!">Delivery Changes</a>
                </li>
                <li>
                  <a href="#!">Returns &amp; Refunds</a>
                </li>
                <li>
                  <a href="#!">Manage your Accunt information</a>
                </li>
                <li>
                  <a href="#!">Revise pament</a>
                </li>
              </ul>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-6">
              <ul className="fraquently-listing">
                <li>
                  <a href="#!">Learn how to...</a>
                </li>
                <li>
                  <a href="#!">Change your Language Prefrence</a>
                </li>
                <li>
                  <a href="#!">Get Started With Noonmar</a>
                </li>
                <li>
                  <a href="#!">Where's My Oroder</a>
                </li>
                <li>
                  <a href="#!">Paying for your Order</a>
                </li>
                <li>
                  <a href="#!">Delivery Changes</a>
                </li>
                <li>
                  <a href="#!">Returns &amp; Refunds</a>
                </li>
                <li>
                  <a href="#!">Manage your Accunt information</a>
                </li>
                <li>
                  <a href="#!">Revise pament</a>
                </li>
              </ul>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-6">
              <ul className="fraquently-listing">
                <li>
                  <a href="#!">Learn how to...</a>
                </li>
                <li>
                  <a href="#!">Change your Language Prefrence</a>
                </li>
                <li>
                  <a href="#!">Get Started With Noonmar</a>
                </li>
                <li>
                  <a href="#!">Where's My Oroder</a>
                </li>
                <li>
                  <a href="#!">Paying for your Order</a>
                </li>
                <li>
                  <a href="#!">Delivery Changes</a>
                </li>
                <li>
                  <a href="#!">Returns &amp; Refunds</a>
                </li>
                <li>
                  <a href="#!">Manage your Accunt information</a>
                </li>
                <li>
                  <a href="#!">Revise pament</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* Frequently Soultions ends*/}
      {/*- need help str*/}
      <section className="NeedHelpSection">
        <div className="container">
          <h2 className="help-section-heading section-heading-noBorder">
            Need Help, Contact us
          </h2>
          <div className="row need-help-row">
            <div className="col-md-5">
              <div className="need-help-card">
                <div className="need-card-left">
                  <img src="/assets/img/icon.png" alt="#" />
                </div>
                <div className="need-card-right">
                  <span className="need-card-title company-cards">
                    Talk to us Live!
                  </span>
                  <a href="#!" className="need-card-btn need-card-btn">
                    Chat now
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <div className="need-help-card">
                <div className="need-card-left">
                  <img src="/assets/img/toop-1.png" alt="#" />
                </div>
                <div className="need-card-right">
                  <span className="need-card-title company-cards">
                    Write to us!
                  </span>
                  <a href="#!" className="need-card-btn">
                    Tell us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*- need help ends*/}
    </Layout>
  );
};

export const getStaticProps = async (context) => {
  return {
    props: {
      protected: null,
    },
  };
};

export default HelpAndSupport;
