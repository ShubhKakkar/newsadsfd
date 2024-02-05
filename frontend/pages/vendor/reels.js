import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { useTranslations } from "next-intl";
// import { useSelector } from "react-redux";

import Layout from "@/components/Vendor/Layout";
import { createAxiosCookies } from "@/fn";
import useRequest from "@/hooks/useRequest";
import { axiosInstance, MEDIA_URL } from "@/api";
import Pagination from "@/components/Pagination";
import { getVendorReels } from "@/services/vendor";

const Reels = ({ initialReels, initialTotalReels }) => {
  const t = useTranslations("Index");
  const [page, setPage] = useState(1);
  // const [perPage, setPerPage] = useState(10);
  const perPage = 10;

  const [reels, setReels] = useState(initialReels);

  const [totalReels, setTotalReels] = useState(initialTotalReels);

  const [deleteReelId, setDeleteReelsId] = useState("");
  const [showReelDeleteModal, setShowReelDeleteModal] = useState(false);

  const [isGridView, setIsGridView] = useState(true);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    getValues,
  } = useForm();

  const { request, response } = useRequest();
  const { request: makeReelAsDraftRequest, response: makeReelAsDraftResponse } =
    useRequest();
  const { request: makeReelPublishRequest, response: makeReelPublishResponse } =
    useRequest();

  const { request: deleteReelRequest, response: deleteReelResponse } =
    useRequest();

  const { request: statusChangeRequest, response: statusChangeResponse } =
    useRequest();

  useEffect(() => {
    if (response) {
      const { reels, totalReels } = response;
      setReels(reels);
      setTotalReels(totalReels);
    }
  }, [response]);

  useEffect(() => {
    if (makeReelAsDraftResponse && makeReelAsDraftResponse.status) {
      const { reelId } = makeReelAsDraftResponse.data;
      toast.success(makeReelAsDraftResponse.message);

      const newReels = [...reels].map((p) => {
        if (p._id == reelId) {
          p.status = "Draft";
        }
        return p;
      });
      setReels(newReels);
    }
  }, [makeReelAsDraftResponse]);

  useEffect(() => {
    if (statusChangeResponse && statusChangeResponse.status) {
      const { id, isActive } = statusChangeResponse.data;
      toast.success(statusChangeResponse.message);

      const newReels = [...reels].map((p) => {
        if (p._id == id) {
          p.isActive = isActive;
        }
        return p;
      });
      setReels(newReels);
    }
  }, [statusChangeResponse]);

  useEffect(() => {
    if (makeReelPublishResponse && makeReelPublishResponse.status) {
      toast.success(makeReelPublishResponse.message);
      const { reelId } = makeReelPublishResponse.data;

      const newReels = [...reels].map((p) => {
        if (p._id == reelId) {
          p.status = "Published";
        }
        return p;
      });
      setReels(newReels);
    }
  }, [makeReelPublishResponse]);

  useEffect(() => {
    if (deleteReelResponse && deleteReelResponse.status) {
      const { id } = deleteReelResponse.data;
      toast.success(deleteReelResponse.message);

      const newReels = reels.filter((p) => p._id !== id);
      setReels(newReels);
      setShowReelDeleteModal(false);
      setTotalReels((prev) => prev - 1);
    }
  }, [deleteReelResponse]);

  useEffect(() => {
    const subscription = watch((values) => {
      setPage(1);

      let { status, isActive } = values;

      request(
        "GET",
        `v1/vendor/reels?page=${page}&perPage=${perPage}&status=${
          status?.value ?? ""
        }&activeStatus=${isActive?.value ?? ""}`
      );
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const fetchMoreData = ({ selected }) => {
    let { status, isActive } = getValues();

    setPage(selected + 1);

    request(
      "GET",
      `v1/vendor/reels?page=${selected + 1}&perPage=${perPage}&status=${
        status?.value ?? ""
      }&activeStatus=${isActive?.value ?? ""}`
    );
  };

  const makeReelPublishHandler = (id) => {
    makeReelPublishRequest("PUT", "v1/vendor/reel/status", {
      id,
      status: "Published",
    });
  };

  const makeReelDraftHandler = (id) => {
    makeReelAsDraftRequest("PUT", "v1/vendor/reel/status", {
      id,
      status: "Draft",
    });
  };

  const reelDeleteHandler = () => {
    deleteReelRequest("DELETE", "v1/vendor/reel", { id: deleteReelId });
  };

  const changeStatusHandler = (id, status) => {
    status = status === true ? false : true;
    statusChangeRequest("PUT", "v1/vendor/reel/active-status", {
      id,
      isActive: status,
    });
  };

  const showingReels = !totalReels ? 0 : 1 + 10 * (page - 1);

  return (
    <Layout seoData={{ pageTitle: "Reels - Noonmar" }}>
      <div className="main_content listingContainer">
        <div className="Export_listing_top"></div>

        <div className="offre_listing_section orderListingBox reels_page_header">
          <div className="AddNewProductBox showing_order">
            <Link href="/vendor/add-reel" legacyBehavior>
              <a
                // onClick={() => setIsImportModalOpen(true)}
                className="Warehouse_button cursor"
              >
                <span>
                  <svg
                    width={16}
                    height={17}
                    viewBox="0 0 16 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.7594 9.876H9.49541V16.14H6.50741V9.876H0.279406V6.888H6.50741V0.66H9.49541V6.888H15.7594V9.876Z"
                      fill="white"
                    />
                  </svg>
                </span>
                <span className="addText">{t("Add More Reels")}</span>
              </a>
            </Link>

            <div className="showing_order">
              <div className="list-grid-toggle">
                <i
                  onClick={() => setIsGridView(true)}
                  className={`[ icon icon--grid ] fa fa-th ${
                    isGridView ? "active" : ""
                  }`}
                />
                <i
                  onClick={() => setIsGridView(false)}
                  className={`[ icon icon--list ] fa fa-list ${
                    isGridView ? "" : "active"
                  }`}
                />
              </div>
              {false && (
                <h5 className="showingTitle">
                  {t("Showing")} {showingReels} -{" "}
                  {reels.length < 10
                    ? totalReels - showingReels > 10
                      ? reels.length
                      : totalReels
                    : 10 * page}{" "}
                  of {totalReels} {t("Reels")}
                </h5>
              )}
            </div>
          </div>
          <div className="order_listing_block listingCategoryInput">
            <div className="row">
              <div className="col-sm-6  col-xl-4 ">
                <div className="form-group">
                  <Controller
                    className="form-control form-control-solid form-control-lg mb-10 col-4"
                    control={control}
                    name="status"
                    render={({ field: { onChange, value, ref } }) => {
                      return (
                        <Select
                          onChange={onChange}
                          placeholder={t("Filter by Status")}
                          options={[
                            { label: t("Published"), value: "Published" },
                            { label: t("Draft"), value: "Draft" },
                          ]}
                          isMulti={false}
                          className="form-select- form-control- dark-form-control libSelect"
                          value={value}
                          isClearable
                        />
                      );
                    }}
                  />
                </div>
              </div>
              <div className="col-sm-6 col-xl-4">
                <div className="form-group">
                  <Controller
                    className="form-control form-control-solid form-control-lg mb-10 col-4"
                    control={control}
                    name="isActive"
                    render={({ field: { onChange, value, ref } }) => {
                      return (
                        <Select
                          onChange={onChange}
                          placeholder={t("Filter by Active Status")}
                          options={[
                            { label: t("Active"), value: true },
                            { label: t("Inactive"), value: false },
                          ]}
                          isMulti={false}
                          value={value}
                          className="form-select- form-control- dark-form-control libSelect"
                          isClearable
                        />
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* listing tabel */}
        <div
          className={`OfferDetailsBlock products ${
            isGridView ? "list-view grid" : ""
          }`}
        >
          <div className="table-responsive">
            <table className="table align-middle table-borderless table-border-spacing">
              <thead>
                <tr>
                  {/* <th className="check-col" scope="col">
                    <div className="custom_checkbox position-relative d-flex check-type2">
                      <input type="checkbox" id="check1" defaultChecked="" />
                    </div>
                  </th> */}
                  <th scope="col">{t("Reel Details")} </th>
                  <th scope="col" className="text-center">
                    {t("Plays")}
                  </th>
                  <th scope="col" className="text-center">
                    {t("Likes")}
                  </th>
                  <th scope="col" className="text-center">
                    {t("Status")}
                  </th>
                  <th scope="col" className="text-center">
                    {t("Active Status")}
                  </th>
                  <th scope="col" className="text-center">
                    {t("Manage Reel")}
                  </th>
                  <th scope="col" className="text-center" />
                </tr>
              </thead>
              <tbody>
                {reels &&
                  reels.map((p) => (
                    <tr className="shadow-effect" key={p._id}>
                      {/* <td className="select-row">
                        <div className="custom_checkbox position-relative check-type2">
                          <input type="checkbox" id="check1" />
                        </div>
                      </td> */}
                      <td className="offer-dtl-col" data-name="Reel Details">
                        <div className="PlatformMarketplace">
                          <div className="blackFridayImg">
                            <div class="reel-videoCard">
                              {/* <video
                                class="swiper-video reel-videoTag"
                                src={`${MEDIA_URL}/${p.video}`}
                                preload="auto"
                                loop
                              ></video> */}
                              <video
                                loop
                                class="swiper-video reel-videoTag videoBlock"
                                preload="auto"
                                width="320"
                                height="240"
                                controls
                              >
                                <source src={`${MEDIA_URL}/${p.video}`} />
                              </video>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center" data-name={t("Plays")}>
                        {p.playCount}
                      </td>
                      <td className="text-center" data-name={t("Likes")}>
                        {p.likeCount}
                      </td>
                      <td className="text-center" data-name={t("Status")}>
                        <div className="productRating">
                          <span>{t(p.status)}</span>
                        </div>
                      </td>
                      <td
                        className="text-center"
                        data-name={t("Active Status")}
                      >
                        <div className="productRating">
                          <span>
                            {p.isActive ? t("Active") : t("Inactive")}
                          </span>
                        </div>
                      </td>
                      <td className="text-center" data-name={t("Manage Reel")}>
                        <div className="productInventory">
                          <span
                            title={t("Edit")}
                            className="products_inventory_pen cursor"
                            onClick={() => router.push(`/vendor/reel/${p._id}`)}
                          >
                            <i className="fas fa-pen" />
                          </span>

                          <span
                            className="products_inventory_delit cursor"
                            title={t("Delete")}
                            onClick={() => {
                              setDeleteReelsId(p._id);
                              setShowReelDeleteModal(true);
                            }}
                          >
                            <i className="fas fa-trash-alt" />
                          </span>
                          {p.isActive ? (
                            <span
                              title={t("Deactivate reel")}
                              className="svg-icon svg-icon-md svg-icon-danger cursor"
                              onClick={() => {
                                changeStatusHandler(p._id, p.isActive);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                // xmlns:xlink="http://www.w3.org/1999/xlink"
                                width="24px"
                                height="24px"
                                viewBox="0 0 24 24"
                                version="1.1"
                              >
                                <g
                                  stroke="none"
                                  strokeWidth="1"
                                  fill="none"
                                  fillRule="evenodd"
                                >
                                  <g
                                    transform="translate(12.000000, 12.000000) rotate(-45.000000) translate(-12.000000, -12.000000) translate(4.000000, 4.000000)"
                                    fill="#000000"
                                  >
                                    <rect
                                      x="0"
                                      y="7"
                                      width="16"
                                      height="2"
                                      rx="1"
                                    ></rect>
                                    <rect
                                      opacity="1"
                                      transform="translate(8.000000, 8.000000) rotate(-270.000000) translate(-8.000000, -8.000000) "
                                      x="0"
                                      y="7"
                                      width="16"
                                      height="2"
                                      rx="1"
                                    ></rect>
                                  </g>
                                </g>
                              </svg>
                            </span>
                          ) : (
                            <span
                              title={t("Activate reel")}
                              className="svg-icon svg-icon-md svg-icon-success cursor"
                              onClick={() => {
                                changeStatusHandler(p._id, p.isActive);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                // xmlns:xlink="http://www.w3.org/1999/xlink"
                                width="24px"
                                height="24px"
                                viewBox="0 0 24 24"
                                version="1.1"
                              >
                                <g
                                  stroke="none"
                                  strokeWidth="1"
                                  fill="none"
                                  fillRule="evenodd"
                                >
                                  <polygon points="0 0 24 0 24 24 0 24"></polygon>
                                  <path
                                    d="M9.26193932,16.6476484 C8.90425297,17.0684559 8.27315905,17.1196257 7.85235158,16.7619393 C7.43154411,16.404253 7.38037434,15.773159 7.73806068,15.3523516 L16.2380607,5.35235158 C16.6013618,4.92493855 17.2451015,4.87991302 17.6643638,5.25259068 L22.1643638,9.25259068 C22.5771466,9.6195087 22.6143273,10.2515811 22.2474093,10.6643638 C21.8804913,11.0771466 21.2484189,11.1143273 20.8356362,10.7474093 L17.0997854,7.42665306 L9.26193932,16.6476484 Z"
                                    fill="#000000"
                                    fillRule="nonzero"
                                    opacity="0.3"
                                    transform="translate(14.999995, 11.000002) rotate(-180.000000) translate(-14.999995, -11.000002) "
                                  ></path>
                                  <path
                                    d="M4.26193932,17.6476484 C3.90425297,18.0684559 3.27315905,18.1196257 2.85235158,17.7619393 C2.43154411,17.404253 2.38037434,16.773159 2.73806068,16.3523516 L11.2380607,6.35235158 C11.6013618,5.92493855 12.2451015,5.87991302 12.6643638,6.25259068 L17.1643638,10.2525907 C17.5771466,10.6195087 17.6143273,11.2515811 17.2474093,11.6643638 C16.8804913,12.0771466 16.2484189,12.1143273 15.8356362,11.7474093 L12.0997854,8.42665306 L4.26193932,17.6476484 Z"
                                    fill="#000000"
                                    fillRule="nonzero"
                                    transform="translate(9.999995, 12.000002) rotate(-180.000000) translate(-9.999995, -12.000002) "
                                  ></path>
                                </g>
                              </svg>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="action-col">
                        <div className="RedemptionDropdown">
                          <div className="dropdown">
                            <button
                              className="btn-action-filter video_deropIcon dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <i className="fas fa-ellipsis-v" />
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <div className="action_radios">
                                  <div className="form-group custom_radio">
                                    {p.status == "Published" ? (
                                      <label
                                        onClick={() =>
                                          makeReelDraftHandler(p._id)
                                        }
                                      >
                                        {t("Make Draft")}
                                      </label>
                                    ) : (
                                      <label
                                        onClick={() =>
                                          makeReelPublishHandler(p._id)
                                        }
                                      >
                                        {t("Publish Reel")}
                                      </label>
                                    )}
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          currentPage={page}
          totalItems={totalReels}
          perPage={perPage}
          fetchMoreItems={fetchMoreData}
        />
      </div>

      <Modal show={showReelDeleteModal}>
        <Modal.Header>
          <Modal.Title>{t("Delete Confirmation")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            {t("Are you sure you want to delete this reel?")}
          </div>
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary"> */}
          <Button
            variant="secondary"
            onClick={() => setShowReelDeleteModal(false)}
          >
            {t("Cancel")}
          </Button>
          {/* <Button variant="danger" onClick={handleDelete}> */}
          <Button variant="danger" onClick={reelDeleteHandler}>
            {t("Delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};
export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const { reels, totalReels } = await getVendorReels();

  return {
    props: {
      initialReels: reels,
      initialTotalReels: totalReels,
      protected: true,
      userTypes: ["vendor"],
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default Reels;
