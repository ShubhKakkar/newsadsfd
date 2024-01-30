import React, { useState, useEffect, Fragment } from "react";
import Moment from "react-moment";
import { useSelector } from "react-redux";
import Modal from "react-modal";

import { SubTab } from "../Cms/TabNInput";
import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { API } from "../../constant/api";

const Activated = () => (
  <span className="label label-lg label-light-success label-inline">
    Activated
  </span>
);

const Deactivated = () => (
  <span className="label label-lg label-light-danger label-inline">
    Deactivated
  </span>
);

const MediaPreview = ({ media }) => {
  return (
    <div className="col-4 px-2 px-md-3 col-md-2">
      <div className="meCard">
        <a href="javascript:void(0);">
          {media.isImage ? (
            <img src={`${API.PORT}/${media.src}`} alt="" />
          ) : (
            <video controls muted>
              <source src={`${API.PORT}/${media.src}`} type="video/mp4" />
            </video>
          )}
        </a>
      </div>
    </div>
  );
};

const ViewOne = (props) => {
  const { id: productId } = props.match.params;

  const [detailsData, setDetailsData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [features, setFeatures] = useState([]);
  const [meta, setMeta] = useState([]);
  const [media, setMedia] = useState([]);
  const [variants, setVariants] = useState([]);
  const [variantTh, setVariantTh] = useState([]);

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);

  const [tabIndex, setTabIndex] = useState(0);

  const { response: responseProductData, request: requestProductData } =
    useRequest();

  const { date_format } = useSelector((state) => state.setting);

  useEffect(() => {
    requestProductData("GET", `product/${productId}`);

    document.title = "View Product - Noonmar";
  }, []);

  useEffect(() => {
    if (responseProductData) {
      const {
        name,
        price,
        discountedPrice,
        quantity,
        featureTitle,
        features,
        description,
        media,
        metaData,
        variants,
        isPublished,
        isActive,
        createdAt,
        customId,
        warehouseData,
        productVariantsData,
        vendorName,
        mainCategoryName,
        subCategoryName,
        brandName,
        shortDescription,
        longDescription,
      } = responseProductData.data;

      const detailsDataArr = [];

      variants.forEach((v, idx) => {
        detailsDataArr.push({
          title: `${idx === 0 ? "First" : "Second"} Variant Name`,
          value: v.name,
        });
      });

      if (detailsDataArr.length === 2) {
        setVariantTh([
          detailsDataArr[0].value,
          detailsDataArr[1].value,
          // "Price",
          // "Discounted Price",
          "Quantity",
          "Width",
          "Height",
          "Weight",
          "Media",
        ]);
      } else if (detailsDataArr.length === 1) {
        setVariantTh([
          detailsDataArr[0].value,
          // "Price",
          // "Discounted Price",
          "Quantity",
          "Width",
          "Height",
          "Weight",
          "Media",
        ]);
      }

      setDetailsData([
        { title: "Name", value: name },
        { title: "Vendor Name", value: vendorName },
        { title: "Product Id", value: customId },
        { title: "Main Category Name", value: mainCategoryName },
        { title: "Sub Category Name", value: subCategoryName },
        ...detailsDataArr,
        { title: "Brand Name", value: brandName },
        // { title: "Price", value: price },
        // { title: "Discounted Price", value: discountedPrice },
        { title: "Quantity", value: quantity },
        { title: "Short Description", value: shortDescription },
        {
          title: "Long Description",
          value: <div dangerouslySetInnerHTML={{ __html: longDescription }} />,
        },
        { title: "Publish Status", value: isPublished ? "Published" : "Draft" },
        { title: "Status", value: isActive ? <Activated /> : <Deactivated /> },
        {
          title: "Created At",
          value: <Moment format={date_format}>{createdAt}</Moment>,
        },
      ]);

      if (warehouseData.length > 0) {
        const warehouseArray = warehouseData.map((data) => [
          { title: "Warehouse Name / Label", value: data.name },
          { title: "Address", value: data.address ? data.address : "-" },
          { title: "City", value: data.city ? data.city : "-" },
          { title: "State", value: data.state ? data.state : "-" },
          { title: "Street", value: data.street ? data.street : "-" },
          {
            title: "Country",
            value: data.countryName ? data.countryName : "-",
          },
          {
            title: "Status",
            value: data.isActive ? <Activated /> : <Deactivated />,
          },
        ]);
        setWarehouses(warehouseArray);
      }

      let featuresArr = [{ title: "Feature Title", value: featureTitle }];

      features.forEach((feature) => {
        featuresArr.push({
          title: feature.label,
          value: feature.value,
        });
      });

      setFeatures(featuresArr);

      setMeta([
        { title: "Title", value: metaData.title || "-" },
        { title: "Description", value: metaData.description || "-" },
        { title: "Author", value: metaData.author || "-" },
        { title: "Keywords", value: metaData.keywords || "-" },
        { title: "Twitter Card", value: metaData.twitterCard || "-" },
        { title: "Twitter Site", value: metaData.twitterSite || "-" },
        { title: "OG Url", value: metaData.ogUrl || "-" },
        { title: "OG Type", value: metaData.ogType || "-" },
        { title: "OG Title", value: metaData.ogTitle || "-" },
        { title: "OG Description", value: metaData.ogDescription || "-" },
        { title: "OG Tag", value: metaData.ogTag || "-" },
        { title: "OG Alt Tag", value: metaData.ogAltTag || "-" },
      ]);

      setMedia(media);
      setVariants(productVariantsData);
    }
  }, [responseProductData]);

  const currentTabIndexHandler = (idx) => {
    setTabIndex(idx);
  };

  const variantMediaHandler = (id) => {
    setSelectedMedia(variants.find((v) => v._id === id)?.media ?? []);
    setIsMediaModalOpen(true);
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="View Product"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/products", name: "Back To Products" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom gutter-b">
            <div className="card-header card-header-tabs-line">
              <div className="card-toolbar">
                <ul
                  className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                  role="tablist"
                >
                  {[
                    "Product Information",
                    "Warehouses",
                    "Features",
                    "Meta",
                    "Media",
                    "Variants",
                  ]
                    .filter((d) => {
                      if (variantTh.length === 0 && d === "Variants") {
                        return false;
                      } else {
                        return d;
                      }
                    })
                    .map((data, index) => (
                      <SubTab
                        key={index}
                        name={data}
                        index={index}
                        onClick={currentTabIndexHandler}
                      />
                    ))}
                </ul>
              </div>
            </div>

            <div
              style={{
                display: tabIndex === 0 ? "block" : "none",
              }}
              className="card-body px-0"
            >
              <div className="tab-content px-10">
                <div
                  className={`tab-pane ${tabIndex === 0 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_0`}
                  role="tabpanel"
                >
                  {detailsData.length > 0 &&
                    detailsData.map((data, index) => (
                      <div key={index} className="form-group row my-2">
                        <label className="col-4 col-form-label">
                          {data.title}
                        </label>
                        <div className="col-8">
                          <span className="form-control-plaintext font-weight-bolder">
                            {data.value}
                          </span>
                        </div>
                      </div>
                    ))}

                  <div className="row"></div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: tabIndex === 1 ? "block" : "none",
              }}
              className="card-body px-0"
            >
              <div className="tab-content px-10">
                <div
                  className={`tab-pane ${tabIndex === 1 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_1`}
                  role="tabpanel"
                >
                  {warehouses.length > 0 &&
                    warehouses.map((warehouse, index) => (
                      <Fragment key={index}>
                        {warehouse.map((data, i) => (
                          <div key={i} className="form-group row my-2">
                            <label className="col-4 col-form-label">
                              {data.title}
                            </label>
                            <div className="col-8">
                              <span className="form-control-plaintext font-weight-bolder">
                                {data.value}
                              </span>
                            </div>
                          </div>
                        ))}
                        <hr />
                      </Fragment>
                    ))}

                  <div className="row"></div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: tabIndex === 2 ? "block" : "none",
              }}
              className="card-body px-0"
            >
              <div className="tab-content px-10">
                <div
                  className={`tab-pane ${tabIndex === 2 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_0`}
                  role="tabpanel"
                >
                  {features.length > 0 &&
                    features.map((data, index) => (
                      <div key={index} className="form-group row my-2">
                        <label className="col-4 col-form-label">
                          {data.title}
                        </label>
                        <div className="col-8">
                          <span className="form-control-plaintext font-weight-bolder">
                            {data.value}
                          </span>
                        </div>
                      </div>
                    ))}

                  <div className="row"></div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: tabIndex === 3 ? "block" : "none",
              }}
              className="card-body px-0"
            >
              <div className="tab-content px-10">
                <div
                  className={`tab-pane ${tabIndex === 3 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_0`}
                  role="tabpanel"
                >
                  {meta.length > 0 &&
                    meta.map((data, index) => (
                      <div key={index} className="form-group row my-2">
                        <label className="col-4 col-form-label">
                          {data.title}
                        </label>
                        <div className="col-8">
                          <span className="form-control-plaintext font-weight-bolder">
                            {data.value}
                          </span>
                        </div>
                      </div>
                    ))}

                  <div className="row"></div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: tabIndex === 4 ? "block" : "none",
              }}
              className="card-body px-0"
            >
              <div className="tab-content px-10">
                <div
                  className={`tab-pane ${tabIndex === 4 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_0`}
                  role="tabpanel"
                >
                  <div className="modal-body instadata">
                    <div className="continueBx_">
                      <div className="form_input_area">
                        <div className="row">
                          {media.length > 0 &&
                            media.map((data, index) => (
                              <MediaPreview media={data} />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: tabIndex === 5 ? "block" : "none",
              }}
              className="card-body px-0"
            >
              <div className="tab-content px-10">
                <div
                  className={`tab-pane custom ${
                    tabIndex === 5 ? "active" : ""
                  }`}
                  id={`kt_apps_contacts_view_tab_0`}
                  role="tabpanel"
                >
                  <table>
                    <tr>
                      {variantTh.map((name, idx) => (
                        <th key={idx}>{name}</th>
                      ))}
                    </tr>
                    {variants.map((variant) => (
                      <tr key={variant._id}>
                        <td>{variant.firstSubVariantName}</td>
                        {variantTh.length === 9 && (
                          <td>{variant.secondSubVariantName}</td>
                        )}
                        {/* <td>{variant.price}</td> */}
                        {/* <td>{variant.discountedPrice}</td> */}
                        <td>{variant.quantity}</td>
                        <td>{variant.width}</td>
                        <td>{variant.height}</td>
                        <td>{variant.weight}</td>
                        <td>
                          <button
                            className="btn btn-primary mr-2"
                            onClick={() => variantMediaHandler(variant._id)}
                            type="button"
                          >
                            Media
                          </button>
                        </td>
                      </tr>
                    ))}
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isMediaModalOpen}
        onRequestClose={() => setIsMediaModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Media Library
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsMediaModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body instadata mediaInPopup">
            <div className="continueBx_">
              <div className="form_input_area">
                <div className="row">
                  {selectedMedia?.length === 0
                    ? "No Media Uploaded"
                    : selectedMedia?.map((media, idx) => (
                        <MediaPreview media={media} key={idx} />
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViewOne;
