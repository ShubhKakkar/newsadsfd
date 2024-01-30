import React, { useState, useEffect } from "react";
import { Controller } from "react-hook-form";

import useRequest from "@/hooks/useRequest";

export const DynamicCategory = ({ filter, register, control, unregister }) => {
  const [childCategories, setChildCategories] = useState({});

  const [filterObj, setFilterObj] = useState({});

  const { request: requestChildCategories, response: responseChildCategories } =
    useRequest();

  useEffect(() => {
    if (responseChildCategories) {
      const { id, category } = responseChildCategories;

      setChildCategories((prev) => ({ ...prev, [id]: category }));

      let values;

      if (filterObj.values) {
        values = [...filterObj.values, ...category];
      } else {
        values = category;
      }

      setFilterObj({
        _id: `categoryOne${filter.key + 1}`,
        name: "Other Categories",
        values,
        key: filter.key + 1,
      });
    }
  }, [responseChildCategories]);

  const categoryHandler = (id, isChecked) => {
    if (isChecked) {
      requestChildCategories("POST", "v1/product-categories/child-categories", {
        id,
      });
    } else {
      const newChildCategories = { ...childCategories };
      newChildCategories[id].forEach((key) => {
        unregister(`dynamicCategory.categoryOne${filter.key + 1}_${key._id}`);
      });

      setFilterObj({
        _id: `categoryOne${filter.key + 1}`,
        name: "Other Categories",
        values: filterObj.values.filter(
          (b) => newChildCategories[id].indexOf(b) === -1
        ),
        key: filter.key + 1,
      });

      delete newChildCategories[id];
      setChildCategories(newChildCategories);
    }
  };

  return (
    <>
      {/* {filters.map((filter) => ( */}
      <div key={filter._id} className="accordion-item">
        <h2 className="accordion-header" id={`flush-heading${filter._id}`}>
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#flush-collapse${filter._id}`}
            aria-expanded="false"
            aria-controls={`flush-collapse${filter._id}`}
          >
            {filter.name}
          </button>
        </h2>
        <div
          id={`flush-collapse${filter._id}`}
          className="accordion-collapse collapse"
          aria-labelledby={`flush-heading${filter._id}`}
          data-bs-parent="#accordionFlushExample"
        >
          <div className="accordion-body">
            <div className="stock-checkBox">
              {filter.values.map((val) => (
                <div key={val._id} className="form-check">
                  <div className="custom_checkbox position-relative check-type2">
                    {/* <input
                      className="form-check-input"
                      type="checkbox"
                      defaultValue=""
                      id={value._id}
                      {...register(
                        `dynamicCategory.${filter._id}_${value._id}`
                      )}
                    /> */}

                    <Controller
                      control={control}
                      name={`dynamicCategory.${filter._id}_${val._id}`}
                      render={({ field: { onChange, value, ref } }) => {
                        return (
                          <input
                            className="form-check-input"
                            type="checkbox"
                            defaultValue=""
                            id={val._id}
                            onChange={(eventValue) => {
                              categoryHandler(
                                val._id,
                                eventValue.target.checked
                              );
                              onChange(eventValue);
                            }}
                            value={value}
                          />
                        );
                      }}
                    />
                  </div>
                  <label className="form-check-label" htmlFor={val._id}>
                    {val.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {filterObj.values?.length > 0 && (
        <DynamicCategory
          filter={filterObj}
          register={register}
          control={control}
          unregister={unregister}
        />
      )}
      {/* ))} */}
    </>
  );
};
