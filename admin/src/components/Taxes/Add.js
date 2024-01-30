import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
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

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    control,
  } = useForm();

  const { response, request } = useRequest();
  const { response: responseCategories, request: requestCategories } =
    useRequest();
  const { response: responseCountries, request: requestCountries } =
    useRequest();
  const [allCategory, setAllCategory] = useState([]);
  const [allCountry, setAllCountry] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Tax - Noonmar";
    // requestCategories("GET",`product-category/all?page=1&isActive=${true}`)
    requestCountries("GET", `country/all?page=1&isActive=${true}`);
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Tax has been added successfully.");
      history.push("/taxes");
    }
  }, [response]);

  useEffect(() => {
    if (responseCountries) {
      if (responseCountries.status && responseCountries.data) {
        setAllCountry(responseCountries.data);
      }
    }
  }, [responseCountries]);

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
    const { tax, productCategoryId, countryId, name } = data;

    request("POST", "tax", { tax, productCategoryId, countryId, name });
  };

  const handleChange = (event) => {
    setSelectedCategory(event);

    if (event && event.length > 0) {
      let catgeoryids = [];
      event.forEach((obj) => {
        catgeoryids.push(obj.value);
      });
      setError("productCategoryId", "");
      setValue("productCategoryId", catgeoryids);
    } else {
      setValue("productCategoryId", null);
    }
  };

  const handleChangeCountry = (countryId) => {
    setSelectedCategory("");
    setValue("productCategoryId", null);
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
      },
      {
        Component: ReactSelectInput,
        label: "Product Category",
        name: "productCategoryId",
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
        title="Add Tax"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/taxes", name: "Back To Taxes" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Add New Tax</h3>
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

export default Add;
