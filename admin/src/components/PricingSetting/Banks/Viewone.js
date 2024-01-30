import React, { useState, useEffect } from "react";
import Moment from "react-moment";
import { useSelector } from "react-redux";

import { SubTab } from "../../Cms/TabNInput";
import useRequest from "../../../hooks/useRequest";
import Breadcrumb from "../../Breadcrumb/Breadcrumb";
import Table from "../../Table/Table";
import Pagination from "../../Pagination/Pagination";
import { addOneToDate } from "../../../util/fn";

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

const OBJ_TABLE = {
  name: "name",
 
  "Product Id": "customId",
  Category: "categoryName",
 
  brand: "brandName",
  "created at": "createdAt",
  status: "isActive",
  "publish status": "status",
  // "is Sponsored": "isSponsored",
};

const ViewOne = (props) => {
  const { id: bankId } = props.match.params;

  const [userData, setUserData] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [perPage, setPerPage] = useState(0);

  const [currentSort, setCurrentSort] = useState({
    sortBy: "created at",
    order: "desc",
  });

  const { response: responseData, request: requestData } = useRequest();

  const { response: responseProducts, request: requestProducts } = useRequest();

  const { date_format, records_per_page } = useSelector(
    (state) => state.setting
  );

  useEffect(() => {
    if (records_per_page) {
      requestData(
        "GET",
        `bank/${bankId}?per_page=${records_per_page}`
      );

      document.title = "View Bank - Noonmar";
      setPerPage(records_per_page);
    }
  }, [records_per_page]);

  useEffect(() => {
    if (responseData) {
      const {
        name,
     //   country,
        address,
        // geoLocation,
        isActive,
        information,
        createdAt,
      } = responseData.banks;

      setUserData([
        { title: "Bank Name", value: name },
        
       
        {
          title: "Address",
          value: address,
        },
        {
            title: "Information",
            value: information,
          },
        {
          title: "Created At",
          value: <Moment format={date_format}>{createdAt}</Moment>,
        },
        {
          title: "Status",
          value: isActive ? <Activated /> : <Deactivated />,
        },
      ]);
    }
  }, [responseData]);

  useEffect(() => {
    if (responseProducts) {
      setProducts(responseProducts.data);
      setTotalDocuments((prev) => responseProducts.totalDocuments ?? prev);
    }
  }, [responseProducts]);

  const currentTabIndexHandler = (idx) => {
    setTabIndex(idx);
  };

  const fetchMoreData = ({ selected }) => {
    setProducts([]);

    setPage(selected + 1);

    // requestProducts(
    //   "GET",
    //   `warehouse/products?page=${selected + 1}&per_page=${perPage}&sortBy=${
    //     currentSort.sortBy
    //   }&order=${currentSort.order}&dateFrom="1970-01-01"&dateTo=${addOneToDate(
    //     new Date()
    //   )}&bankId=${bankId}&isSelected=true`
    // );
  };

  const perPageChangeHandler = (event) => {
    const perPage = event.target.value;

    // requestProducts(
    //   "GET",
    //   `warehouse/products?page=${1}&per_page=${perPage}&sortBy=${
    //     currentSort.sortBy
    //   }&order=${currentSort.order}&dateFrom="1970-01-01"&dateTo=${addOneToDate(
    //     new Date()
    //   )}&bankId=${bankId}&isSelected=true`
    // );

    setPage(1);

    setPerPage(event.target.value);
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="View Bank"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/pricing-setting/banks", name: "Back To Banks" },
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
                 
                  {["Bank Information"].map((data, index) => (
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
                  {userData.length > 0 &&
                    userData.map((user, index) => (
                      <div key={index} className="form-group row my-2">
                        <label className="col-4 col-form-label">
                          {user.title}
                        </label>
                        <div className="col-8">
                          <span className="form-control-plaintext font-weight-bolder">
                            {user.value}
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
                  <div className="dataTables_wrapper ">
                    <Table
                      currentSort={currentSort}
                      sortingHandler={() => {}}
                      mainData={products}
                      tableHeading={Object.keys(OBJ_TABLE)}
                      tableData={Object.values(OBJ_TABLE)}
                      onlyDate={{
                        createdAt: "date",
                        startDate: "dateTime",
                        endDate: "dateTime",
                      }}
                    />

                    {perPage !== 0 && (
                      <Pagination
                        page={page}
                        totalDocuments={totalDocuments}
                        getNewData={fetchMoreData}
                        perPage={perPage}
                        defaultPerPage={records_per_page}
                        perPageChangeHandler={perPageChangeHandler}
                        currentDocLength={products.length}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOne;
