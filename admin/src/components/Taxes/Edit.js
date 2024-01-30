import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  SelectInput,
  RenderInputFields,
  SubmitButton,
  ReactSelectInput,
} from "../Form/Form";

const Edit = (props) => {
  const { id: recordId } = props.match.params;
  const history = useHistory();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    control,
  } = useForm();

  const { response: responseFetchUser, request: requestFetchSeeker } =
    useRequest();
  const { response, request } = useRequest();
  const { response: responseCategories, request: requestCategories } =
    useRequest();
  const { response: responseCountries, request: requestCountries } =
    useRequest();

  const [allCategory, setAllCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [allCountry, setAllCountry] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState();

  useEffect(() => {
    if (recordId) {
      requestFetchSeeker("GET", `tax/${recordId}`);
      requestCountries("GET", `country/all?page=1&isActive=${true}`);
      // requestCategories("GET",`product-category/all?page=1&isActive=${true}`)
      document.title = "Edit Tax - Noonmar";
    }
  }, [recordId]);

  useEffect(() => {
    if (responseCountries) {
      if (responseCountries.status && responseCountries.data) {
        setAllCountry(responseCountries.data);
      }
    }
  }, [responseCountries]);

  useEffect(() => {
    if (responseFetchUser) {
      const { tax, name, productCategoryId, countryId } =
        responseFetchUser.data;
      let categories = [];
      let categoryIds = [];
      const countryID = countryId._id ? countryId._id : "";
      if (productCategoryId && productCategoryId.length > 0) {
        productCategoryId.forEach((obj) => {
          categories.push({
            label: obj.name,
            value: obj._id,
          });
          categoryIds.push(obj._id);
        });
        setSelectedCategory(categories);
      }
      setValue("name", name);
      setValue("tax", tax);
      setValue("productCategory", categoryIds);
      setValue("countryId", countryID);
      setSelectedCountry(countryID);
      requestCategories(
        "GET",
        `product-category/all?page=1&isActive=${true}&country=${countryID}`
      );
    }
  }, [responseFetchUser]);

  useEffect(() => {
    if (response) {
      toast.success("Tax has been updated successfully.");
      history.push("/taxes");
    }
  }, [response]);

  useEffect(() => {
    if (responseCategories) {
      if (responseCategories.status && responseCategories.data) {
        let categories = [];
        if (responseCategories.data.length > 0) {
          responseCategories.data.forEach((obj) => {
            categories.push({
              label: obj.name,
              value: obj._id,
            });
          });
        }
        setAllCategory(categories);
      }
    }
  }, [responseCategories]);
  const onSubmit = (data) => {
    const { tax, name, productCategory, countryId } = data;
    request("PUT", "tax", {
      tax,
      productCategoryId: productCategory,
      countryId,
      id: recordId,
      name,
    });
  };

  const handleChange = (event) => {
    setSelectedCategory(event);

    if (event && event.length > 0) {
      let catgeoryids = [];
      event.forEach((obj) => {
        catgeoryids.push(obj.value);
      });
      setError("productCategory", "");
      setValue("productCategory", catgeoryids);
    } else {
      setValue("productCategory", null);
    }
  };

  const handleChangeCountry = (countryId) => {
    setSelectedCountry(countryId);
    setSelectedCategory("");
    setValue("productCategory", "");
    setAllCategory([]);
    if (countryId != null && countryId != "") {
      requestCategories(
        "GET",
        `product-category/all?page=1&isActive=${true}&country=${countryId}`
      );
    }
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Name",
        type: "name",
        name: "name",
        registerFields: {
          required: true,
          // pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
        },
        registerFieldsFeedback: {
          pattern: "Name field required.",
        },
      },
      {
        Component: SelectInput,
        label: "Country",
        name: "countryId",
        registerFields: {
          required: true,
        },
        children: allCountry && allCountry.length > 0 && (
          <>
            <option value="">{"Select an option"}</option>
            {allCountry.map((obj) => (
              <option key={obj._id} value={obj._id}>
                {" "}
                {obj.name}
              </option>
            ))}
          </>
        ),
        onChange: handleChangeCountry,
        isEdit: true,
        defaultValue: selectedCountry,
      },
      {
        Component: ReactSelectInput,
        label: "Product Category",
        name: "productCategory",
        registerFields: {
          required: true,
        },
        control,
        options: allCategory,
        handleChange: handleChange,
        selectedOption: selectedCategory,
        isMultiple: true,
      },
      {
        Component: Input,
        label: "Tax",
        type: "text",
        name: "tax",
        registerFields: {
          required: true,
          pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
        },
        registerFieldsFeedback: {
          pattern: "Tax can only contain numbers.",
        },
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Tax"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/taxes" /*backPageNum: page */ },
            name: "Back To Taxes",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Edit Tax</h3>
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
                      name="Update"
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

export default Edit;
