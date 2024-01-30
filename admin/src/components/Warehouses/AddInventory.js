import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import GooglePlace from "../GooglePlace/GooglePlace";
import {
  Input,
  SelectInput,
  RenderInputFields,
  ReactSelectInput,
  SubmitButton,
} from "../Form/Form";

const AddInventory = (props) => {
  const { id: warehouseId } = props.match.params;
  let currDate = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control: Control,

    setError,
    clearErrors,
  } = useForm();

  const { response, request } = useRequest();
  // const { response: responseVendors, request: requestVendors } = useRequest();
  const { request: requestCategories, response: responseCategories } =
    useRequest();
  const { response: responseSearchData, request: requestSearchData } =
    useRequest();
  const { request: requestProducts, response: responseProducts } = useRequest();
  const [allBrands, setAllBrands] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [minDate, setMinDate] = useState(currDate);
  const [minEndDate, setMinEndDate] = useState(currDate);
  const history = useHistory();

  useEffect(() => {
    document.title = "Create Inventory Report - Noonmar";
    requestCategories("GET", "v1/user/product-category");
    requestSearchData("GET", `product/search-data`);
    requestProducts(
      "GET",
      `warehouse/products?page=1&per_page=1000&warehouseId=${warehouseId}`
    );
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Warehouse Invenory Report has been added successfully.");
      history.push(`/warehouse/inventory-reports/${warehouseId}`);
    }
  }, [response]);

  // useEffect(() => {
  //   if (responseVendors) {
  //     if (responseVendors.status && responseVendors.users) {
  //       setAllVendors(responseVendors.users);
  //     }
  //   }
  // }, [responseVendors]);

  const handleChangeProduct = (event) => {
    setSelectedProduct(event);
    if (event && event.length > 0) {
      let productids = event.map((obj) => obj.value);
      setError("productIds", "");
      setValue("productIds", productids);
    } else {
      setValue("productIds", null);
    }
  };
  const handleChangeBrand = (event) => {
    setSelectedBrand(event);
    if (event && event.length > 0) {
      let brandids = event.map((obj) => obj.value);
      setError("brandIds", "");
      setValue("brandIds", brandids);
    } else {
      setValue("brandIds", null);
    }
  };
  const handleChangeCategory = (event) => {
    setSelectedCategory(event);
    if (event && event.length > 0) {
      let categoryids = event.map((obj) => obj.value);
      setError("categoryIds", "");
      setValue("categoryIds", categoryids);
    } else {
      setValue("categoryIds", null);
    }
  };

  useEffect(() => {
    if (responseSearchData) {
      //   setAllVendors(responseSearchData.vendors);
      // setAllCategories(responseSearchData.mainCategories);
      setAllBrands(
        responseSearchData.brands.map((data) => ({
          label: data.name,
          value: data._id,
        }))
      );
    }
  }, [responseSearchData]);

  useEffect(() => {
    if (responseProducts) {
      setAllProducts(
        responseProducts.data.map((data) => ({
          label: data.name,
          value: data._id,
        }))
      );
    }
  }, [responseProducts]);

  useEffect(() => {
    if (responseCategories) {
      setAllCategories(
        responseCategories.category.map((data) => ({
          label: data.label,
          value: data.value,
        }))
      );
    }
  }, [responseCategories]);

  const handleDateChange = (e, field) => {
    if (field == "dateFrom") {
      const endDate = getValues("dateTo");
      if (new Date(endDate).getTime() < new Date(e.target.value).getTime()) {
        setValue("dateTo", e.target.value);
      }
      setMinEndDate(e.target.value);
    }
  };

  const onSubmit = (data) => {
    const { name, productIds, categoryIds, brandIds, dateFrom, dateTo } = data;
    request("POST", "warehouse/inventory-report", {
      // vendor,
      name,
      productIds,
      categoryIds,
      brandIds,
      dateFrom,
      dateTo,
      warehouseId,
    });
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Name",
        type: "text",
        name: "name",
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "Warehouse Name/Label can only contain letters.",
        // },
      },
      // {
      //   Component: SelectInput,
      //   label: "Vendor",
      //   name: "vendor",
      //   registerFields: {
      //     required: true,
      //   },
      //   children: allVendors && allVendors.length > 0 && (
      //     <>
      //       <option value="">{"Select an option"}</option>
      //       {allVendors.map((obj) => (
      //         <option key={obj._id} value={obj._id}>
      //           {" "}
      //           {obj.businessName}
      //         </option>
      //       ))}
      //     </>
      //   ),
      // },

      //   {
      //     Component: SelectInput,
      //     label: "Product",
      //     name: "productId",
      //     registerFields: {
      //       required: true,
      //     },
      //     children: allProducts && allProducts.length > 0 && (
      //       <>
      //         <option value="">{"Select an option"}</option>
      //         {allProducts.map((obj) => (
      //           <option key={obj._id} value={obj._id}>
      //             {" "}
      //             {obj.name}
      //           </option>
      //         ))}
      //       </>
      //     ),
      //   },
      //   {
      //     Component: SelectInput,
      //     label: "Category",
      //     name: "categoryId",
      //     registerFields: {
      //       required: true,
      //     },
      //     children: allCategories && allCategories.length > 0 && (
      //       <>
      //         <option value="">{"Select an option"}</option>
      //         {allCategories.map((obj) => (
      //           <option key={obj._id} value={obj._id}>
      //             {" "}
      //             {obj.label}
      //           </option>
      //         ))}
      //       </>
      //     ),
      //   },
      //   {
      //     Component: SelectInput,
      //     label: "Brand",
      //     name: "brandId",
      //     registerFields: {
      //       required: true,
      //     },
      //     children: allBrands && allBrands.length > 0 && (
      //       <>
      //         <option value="">{"Select an option"}</option>
      //         {allBrands.map((obj) => (
      //           <option key={obj._id} value={obj._id}>
      //             {" "}
      //             {obj.name}
      //           </option>
      //         ))}
      //       </>
      //     ),
      //   },
      {
        Component: ReactSelectInput,
        label: "Product",
        type: "text",
        name: "productIds",
        options: allProducts ?? [],
        isMultiple: true,
        registerFields: {
          required: false,
          // pattern: /^[A-Za-z ]+$/,
        },
        handleChange: handleChangeProduct,
        selectedOption: selectedProduct,
      },
      {
        Component: ReactSelectInput,
        label: "Brand",
        type: "text",
        name: "brandIds",
        options: allBrands ?? [],
        isMultiple: true,
        registerFields: {
          required: false,
          // pattern: /^[A-Za-z ]+$/,
        },
        handleChange: handleChangeBrand,
        selectedOption: selectedBrand,
      },
      {
        Component: ReactSelectInput,
        label: "Category",
        type: "text",
        name: "categoryIds",
        options: allCategories ?? [],
        isMultiple: true,
        registerFields: {
          required: false,
          // pattern: /^[A-Za-z ]+$/,
        },
        handleChange: handleChangeCategory,
        selectedOption: selectedCategory,
      },
      {
        Component: Input,
        label: "Date From",
        name: "dateFrom",
        type: "date",
        min: minDate,
        registerFields: {
          required: false,
        },
        isDate: true,
        control: Control,
        handleDateChange,
      },
      {
        Component: Input,
        label: "Date To",
        name: "dateTo",
        type: "date",
        min: minEndDate,
        registerFields: {
          required: false,
        },
        isDate: true,
        control: Control,
        handleDateChange,
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Create Inventory Reports"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/warehouses", name: "Back To Warehouses" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Create Inventory Report</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <RenderInputFields
                      InputFields={InputFields}
                      errors={errors}
                      register={register}
                    />

                    <div className="row"></div>

                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmit}
                      name="Submit"
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInventory;
