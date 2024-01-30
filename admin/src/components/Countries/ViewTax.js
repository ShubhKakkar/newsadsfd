import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  ButtonComp,
  MultiReactSelectInput,
  MutliInput,
  SubmitButton,
  ReactSelectInput,
} from "../Form/Form";

const Add = (props) => {
  const { id: countryId } = props.match.params;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    setValue,
  } = useForm();

  const { response, request } = useRequest();
  const { response: responseData, request: requestData } = useRequest();
  const { response: responseGetTax, request: requestGetTax } = useRequest();

  const [subCategoriesObj, setSubCategoriesObj] = useState({});
  const [customCurrencyObj, setCustomCurrencyObj] = useState({});

  const [subCategories, setSubCategories] = useState([]);

  const [taxes, setTaxes] = useState([0]);
  const [nextId, setNextId] = useState(1);
  const [linkedObj, setLinkedObj] = useState({});
  // const [selectedCurrency, setSelectedCurrency] = useState(null);
  // const [allCurrencies, setAllCurrencies] = useState([]);

  const [id, setId] = useState(null);

  const history = useHistory();

  useEffect(() => {
    document.title = "Taxes - Noonmar";
    requestData("GET", "country/tax-categories");
  }, []);

  useEffect(() => {
    if (responseData) {
      requestGetTax("GET", `country/tax/${countryId}`);

      // setSubCategories(
      //   responseData.categories.map((sc) => ({
      //     label: sc.name,
      //     value: sc.id,
      //   }))
      // );

      // const subCategoriesObj = {};

      // responseData.categories.forEach((sc) => {
      //   subCategoriesObj[sc.id] = sc.name;
      // });

      setSubCategories(responseData.categories);

      const subCategoriesObj = {};

      responseData.categories.forEach((sc) => {
        subCategoriesObj[sc.value] = sc.label;
      });

      setSubCategoriesObj(subCategoriesObj);

      // Currencies

      // setAllCurrencies(
      //   responseData.currencies.map((d) => ({
      //     label: d.sign,
      //     value: d._id,
      //   }))
      // );

      // const customCurrencyObj = {};

      // responseData.currencies.forEach((sc) => {
      //   customCurrencyObj[sc._id] = sc.sign;
      // });
      // setCustomCurrencyObj(customCurrencyObj);
    }
  }, [responseData]);

  useEffect(() => {
    if (responseGetTax) {
      if (responseGetTax.tax) {
        setId(responseGetTax.tax._id);
        const taxesArr = responseGetTax.tax.taxes;

        const linkedObj = {};
        const usedSC = [];

        //If category gets deleted then do not show empty sub category field for that
        let currentIndex = 0;

        for (let i = 0; i < taxesArr.length; i++) {
          const item = taxesArr[i];

          if (subCategoriesObj[item.subCategory]) {
            linkedObj[currentIndex] = item.subCategory;

            // setValue(`amount${currentIndex}`, item.amount);

            // setValue(
            //   `customPercentageValue${currentIndex}`,
            //   item.customPercentageValue
            // );

            setValue(`tax${currentIndex}`, item.tax);

            // setValue(`customCell${currentIndex}`, item.customCell);

            usedSC.push(item.subCategory);

            const label = subCategoriesObj[item.subCategory];
            // const currencyLabel = customCurrencyObj[item.customCurrency];

            // setValue(`customCurrency${currentIndex}`, {
            //   label: currencyLabel,
            //   value: item.customCurrency,
            // });
            setValue(`subCategory${currentIndex}`, {
              label,
              value: item.subCategory,
            });
            currentIndex++;
          }
        }

        if (usedSC.length > 0) {
          setTaxes(new Array(currentIndex).fill(0).map((_, idx) => idx));
          setNextId(currentIndex + 1);
          setLinkedObj(linkedObj);

          const newSubCategories = [...subCategories].filter(
            (sc) => !usedSC.includes(sc.value)
          );

          setSubCategories(newSubCategories);
        }
      }
    }
  }, [responseGetTax]);

  useEffect(() => {
    if (response) {
      toast.success("Taxes has been saved successfully.");
      history.push(`/countries`);
    }
  }, [response]);

  const onSubmit = (data) => {
    const taxesArr = [];

    taxes.forEach((key) => {
      taxesArr.push({
        subCategory: data[`subCategory${key}`].value,
        // amount: data[`amount${key}`],
        tax: data[`tax${key}`],
        // customFixedValue: data[`customFixedValue${key}`],
        // customCurrency: data[`customCurrency${key}`].value,
        // customPercentageValue: data[`customPercentageValue${key}`],
      });
    });

    request("PUT", "country/tax", {
      countryId,
      taxes: taxesArr,
      id,
    });
  };

  const addTaxHandler = () => {
    setTaxes((prev) => [...prev, nextId]);
    setNextId((prev) => prev + 1);
  };

  const deleteTaxHandler = (key) => {
    const data = getValues(`subCategory${key}`);

    if (data) {
      let newSubCategories = [...subCategories];
      newSubCategories.push(data);
      setSubCategories(newSubCategories);
    }

    const newTaxes = [...taxes].filter((id) => id !== key);
    setTaxes(newTaxes);
  };

  const selectCategoryHandler = (key, e) => {
    if (linkedObj[key]) {
      let newSubCategories = [...subCategories];
      const newLinkedObj = linkedObj;

      newSubCategories.push({
        label: subCategoriesObj[linkedObj[key]],
        value: linkedObj[key],
      });

      newSubCategories = newSubCategories.filter((sc) => sc.value !== e.value);

      newLinkedObj[key] = e.value;

      setSubCategories(newSubCategories);
      setLinkedObj(newLinkedObj);
    } else {
      const newLinkedObj = linkedObj;
      newLinkedObj[key] = e.value;

      setLinkedObj(newLinkedObj);
      setSubCategories((prev) => prev.filter((p) => p.value !== e.value));
    }
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Taxes"
        links={[
          { to: "/", name: "Dashboard" },
          { to: `/countries`, name: "Back To Countries" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Taxes</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <button
                      class="btn btn-primary mr-2 mb-2 fixedButtonAdd2"
                      type="button"
                      // style={{ bottom: "unset" }}
                      onClick={addTaxHandler}
                    >
                      Add Tax <i class="fas fa-plus p-0"></i>
                    </button>
                    {taxes.map((key) => (
                      <>
                        <div key={key} className="row mt-3">
                          <div className="col-xl-5">
                            <label>Category</label>
                            <MultiReactSelectInput
                              label="Sub Category"
                              name={`subCategory${key}`}
                              errors={errors}
                              registerFields={{ required: true }}
                              options={subCategories}
                              control={control}
                              // colClass="col-xl-4"
                              colClass="w-100"
                              handleChange={(e) => {
                                selectCategoryHandler(key, e);
                              }}
                            />
                          </div>

                          <div className="col-xl-5">
                            <label>Tax</label>
                            <MutliInput
                              type="number"
                              label="Tax "
                              name={`tax${key}`}
                              errors={errors}
                              placeholder="Tax"
                              register={register}
                              registerFields={{
                                required: true,
                                //   pattern: /^[0-9]+$/,
                              }}
                            />
                          </div>
                          {/* <div className="col-xl-2">
                            <label>Tax</label>
                            <MutliInput
                              type="number"
                              label="Tax"
                              name={`amount${key}`}
                              errors={errors}
                              placeholder="Tax"
                              register={register}
                              registerFields={{
                                required: true,
                                //   pattern: /^[0-9]+$/,
                              }}
                              //   colClass="col-xl-2"
                              // registerFieldsFeedback={{
                              //   pattern: "Tax can only contain numbers.",
                              // }}
                            />
                          </div> */}

                          {/* <div className="col-xl-2">
                            <label>Custom Currency</label>
                            <MultiReactSelectInput
                              label="custom currency"
                              name={`customCurrency${key}`}
                              errors={errors}
                              registerFields={{ required: true }}
                              options={allCurrencies}
                              control={control}
                              // colClass="col-xl-4"
                              colClass="w-100"
                              isMultiple={false}
                            />
                          </div>
                          <div className="col-xl-2">
                            <label>Custom Cell</label>
                            <MutliInput
                              type="number"
                              label="Custom cell"
                              name={`customCell${key}`}
                              errors={errors}
                              placeholder="Custom cell"
                              register={register}
                              registerFields={{
                                required: true,
                                //   pattern: /^[0-9]+$/,
                              }}
                              //   colClass="col-xl-2"
                              // registerFieldsFeedback={{
                              //   pattern: "Tax can only contain numbers.",
                              // }}
                            />
                          </div> */}
                          <div className="col-xl-1 py-9">
                            {taxes.length > 1 && (
                              <ButtonComp
                                classes="btn btn-bg-danger"
                                onClick={() => deleteTaxHandler(key)}
                              >
                                <i class="fas fa-trash-alt text-white"></i>
                              </ButtonComp>
                            )}
                          </div>
                        </div>
                        {/* <div className="row mt-3">
                          <label className="col-xl-6 text-right ml-12">
                            <b>Custom Values</b>
                          </label>
                        </div>

                        <div className="row mt-3">
                        

                          <div className="col-xl-5"></div>
                          <div className="col-xl-2">
                            <label>Fixed</label>
                            <MutliInput
                              type="number"
                              label="Fixed "
                              name={`customFixedValue${key}`}
                              errors={errors}
                              placeholder="Custom Fixed value"
                              register={register}
                              registerFields={{
                                required: true,
                                //   pattern: /^[0-9]+$/,
                              }}
                           
                            />
                          </div>
                          <div className="col-xl-2">
                            <label>Percentage</label>
                            <MutliInput
                              type="number"
                              label="Percentage"
                              name={`customPercentageValue${key}`}
                              errors={errors}
                              placeholder="Custom Percentage Value"
                              register={register}
                              registerFields={{
                                required: true,
                                //   pattern: /^[0-9]+$/,
                              }}
                              //   colClass="col-xl-2"
                              // registerFieldsFeedback={{
                              //   pattern: "Tax can only contain numbers.",
                              // }}
                            />
                          </div>
                        </div> */}
                      </>
                    ))}

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
