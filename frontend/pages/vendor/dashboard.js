import Layout from "@/components/Vendor/Layout";

const MyProfile = () => {
  return (
    <Layout seoData={{ pageTitle: "Dashboard - Noonmar" }}>
      <div className="main_content">
        <div className="col-12">
          <div className="headpageTitle mobile-title-show">Dashboard</div>
        </div>
        <div className="DashboardRightContant">
          <div className="saleCountBlock">
            <div className="row">
              <div className="col-md-8">
                <div className="todaySaleBlock dashCard">
                  <div className="innCardHead">
                    <h3 className="InnCardTitle">
                      Today’s Sales
                      <span className="innCardSubTitle">Sales Summery</span>
                    </h3>
                    <span className="saleExportBtn">
                      <a href="javascript:void(0)" className="exportBtn">
                        <svg
                          width={12}
                          height={12}
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.09799 3.11391L6.43631 0.832723C6.31204 0.723785 6.15516 0.668051 5.99745 0.667969C5.88954 0.667913 5.78125 0.693912 5.68275 0.746749C5.63886 0.770235 5.59715 0.798918 5.55859 0.832723L2.89691 3.11391C2.61734 3.35351 2.58495 3.77437 2.82455 4.05394C3.06415 4.3335 3.48501 4.3659 3.76457 4.1263L5.33074 2.78402V7.94712C5.33074 8.31531 5.62922 8.61378 5.99741 8.61378C6.36559 8.61378 6.66407 8.31531 6.66407 7.94712L6.66407 2.78395L8.23032 4.1263C8.50989 4.3659 8.93075 4.3335 9.17035 4.05394C9.40995 3.77437 9.37755 3.35351 9.09799 3.11391ZM1.9974 7.33464C1.9974 6.96645 2.29587 6.66797 2.66406 6.66797H3.66406C4.03225 6.66797 4.33073 6.36949 4.33073 6.0013C4.33073 5.63311 4.03225 5.33464 3.66406 5.33464H2.66406C1.55949 5.33464 0.664062 6.23007 0.664062 7.33464V9.33464C0.664062 10.4392 1.55949 11.3346 2.66406 11.3346H9.33073C10.4353 11.3346 11.3307 10.4392 11.3307 9.33464V7.33464C11.3307 6.23007 10.4353 5.33464 9.33073 5.33464H8.33073C7.96254 5.33464 7.66406 5.63311 7.66406 6.0013C7.66406 6.36949 7.96254 6.66797 8.33073 6.66797H9.33073C9.69892 6.66797 9.9974 6.96645 9.9974 7.33464V9.33464C9.9974 9.70283 9.69892 10.0013 9.33073 10.0013H2.66406C2.29587 10.0013 1.9974 9.70283 1.9974 9.33464V7.33464Z"
                            fill="#0F3659"
                          />
                        </svg>
                        Export
                      </a>
                    </span>
                  </div>
                  <div className="dataCardsView">
                    <div className="row">
                      <div className="col-md-6 col-xl-6 col-xxl-3">
                        <div className="dataCards lightPingBg">
                          <div className="cardIcn">
                            <svg
                              width={18}
                              height={18}
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M2 0C0.895432 0 0 0.895447 0 2V16C0 17.1046 0.895432 18 2 18H16C17.1046 18 18 17.1046 18 16V2C18 0.895447 17.1046 0 16 0H2ZM5 10C5 9.44769 4.55228 9 4 9C3.44772 9 3 9.44769 3 10V14C3 14.5523 3.44772 15 4 15C4.55228 15 5 14.5523 5 14V10ZM9 6C9.55228 6 10 6.44769 10 7V14C10 14.5523 9.55228 15 9 15C8.44772 15 8 14.5523 8 14V7C8 6.44769 8.44772 6 9 6ZM15 4C15 3.44769 14.5523 3 14 3C13.4477 3 13 3.44769 13 4V14C13 14.5523 13.4477 15 14 15C14.5523 15 15 14.5523 15 14V4Z"
                                fill="white"
                              />
                            </svg>
                          </div>
                          <div className="cardValue">$1k</div>
                          <div className="cardTitle">Total Sales</div>
                          <div className="carddataCount">
                            +8% from yesterday
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-xl-6 col-xxl-3">
                        <div className="dataCards lightYellowBg">
                          <div className="cardIcn">
                            <svg
                              width={18}
                              height={18}
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M2 0C0.895432 0 0 0.895447 0 2V16C0 17.1046 0.895432 18 2 18H16C17.1046 18 18 17.1046 18 16V2C18 0.895447 17.1046 0 16 0H2ZM5 10C5 9.44769 4.55228 9 4 9C3.44772 9 3 9.44769 3 10V14C3 14.5523 3.44772 15 4 15C4.55228 15 5 14.5523 5 14V10ZM9 6C9.55228 6 10 6.44769 10 7V14C10 14.5523 9.55228 15 9 15C8.44772 15 8 14.5523 8 14V7C8 6.44769 8.44772 6 9 6ZM15 4C15 3.44769 14.5523 3 14 3C13.4477 3 13 3.44769 13 4V14C13 14.5523 13.4477 15 14 15C14.5523 15 15 14.5523 15 14V4Z"
                                fill="white"
                              />
                            </svg>
                          </div>
                          <div className="cardValue">300</div>
                          <div className="cardTitle">Total Order</div>
                          <div className="carddataCount">
                            +5% from yesterday
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-xl-6 col-xxl-3">
                        <div className="dataCards lightBlueBg">
                          <div className="cardIcn">
                            <svg
                              width={18}
                              height={18}
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M2 0C0.895432 0 0 0.895447 0 2V16C0 17.1046 0.895432 18 2 18H16C17.1046 18 18 17.1046 18 16V2C18 0.895447 17.1046 0 16 0H2ZM5 10C5 9.44769 4.55228 9 4 9C3.44772 9 3 9.44769 3 10V14C3 14.5523 3.44772 15 4 15C4.55228 15 5 14.5523 5 14V10ZM9 6C9.55228 6 10 6.44769 10 7V14C10 14.5523 9.55228 15 9 15C8.44772 15 8 14.5523 8 14V7C8 6.44769 8.44772 6 9 6ZM15 4C15 3.44769 14.5523 3 14 3C13.4477 3 13 3.44769 13 4V14C13 14.5523 13.4477 15 14 15C14.5523 15 15 14.5523 15 14V4Z"
                                fill="white"
                              />
                            </svg>
                          </div>
                          <div className="cardValue">5</div>
                          <div className="cardTitle">Product Sold</div>
                          <div className="carddataCount">
                            +1,2% from yesterday
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-xl-6 col-xxl-3">
                        <div className="dataCards lightOrangeBg">
                          <div className="cardIcn">
                            <svg
                              width={18}
                              height={18}
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M2 0C0.895432 0 0 0.895447 0 2V16C0 17.1046 0.895432 18 2 18H16C17.1046 18 18 17.1046 18 16V2C18 0.895447 17.1046 0 16 0H2ZM5 10C5 9.44769 4.55228 9 4 9C3.44772 9 3 9.44769 3 10V14C3 14.5523 3.44772 15 4 15C4.55228 15 5 14.5523 5 14V10ZM9 6C9.55228 6 10 6.44769 10 7V14C10 14.5523 9.55228 15 9 15C8.44772 15 8 14.5523 8 14V7C8 6.44769 8.44772 6 9 6ZM15 4C15 3.44769 14.5523 3 14 3C13.4477 3 13 3.44769 13 4V14C13 14.5523 13.4477 15 14 15C14.5523 15 15 14.5523 15 14V4Z"
                                fill="white"
                              />
                            </svg>
                          </div>
                          <div className="cardValue">8</div>
                          <div className="cardTitle">New Customers</div>
                          <div className="carddataCount">
                            0,5% from yesterday
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="todaySaleBlock dashCard">
                  <div className="innCardHead">
                    <h3 className="InnCardTitle">Top Products</h3>
                  </div>
                  <div className="dataCardsView">
                    <div className="table-responsive">
                      <table className="table DashTopProducts">
                        <thead>
                          <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Popularity</th>
                            <th scope="col">Sales</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row">1</th>
                            <td>
                              <div className="dashProName">Home Decor</div>
                            </td>
                            <td>
                              <div
                                className="progress dashProProgressBar"
                                role="progressbar"
                                aria-label="Basic example"
                                aria-valuenow={75}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              >
                                <div className="progress-bar w-75" />
                              </div>
                            </td>
                            <td>
                              <div className="DashcoutTag">5</div>
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">2</th>
                            <td>Apple</td>
                            <td>
                              <div
                                className="progress dashProProgressBar"
                                role="progressbar"
                                aria-label="Basic example"
                                aria-valuenow={75}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              >
                                <div className="progress-bar w-75" />
                              </div>
                            </td>
                            <td>
                              <div className="DashcoutTag">4</div>
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">3</th>
                            <td>Bottle</td>
                            <td>
                              <div
                                className="progress dashProProgressBar"
                                role="progressbar"
                                aria-label="Basic example"
                                aria-valuenow={75}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              >
                                <div className="progress-bar w-75" />
                              </div>
                            </td>
                            <td>
                              <div className="DashcoutTag">3</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  return {
    props: {
      protected: true,
      userTypes: ["vendor"],
    },
  };
}

export default MyProfile;
