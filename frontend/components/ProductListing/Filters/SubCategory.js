import React, { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import useTranslate from "@/hooks/useTranslate";


import useRequest from "@/hooks/useRequest";
import { DynamicCategory } from "./DynamicCategory";
import { t } from "i18next";

export const SubCategory = ({
  subCategories,
  register,
  control,
  unregister,
}) => {
  const t = useTranslate();
  const [childCategories, setChildCategories] = useState({});
  //[id]:[value,values]

  const [filter, setFilter] = useState({});
  //_id: categoryOne, name: Other Categories, values[_id, name]

  const { request: requestChildCategories, response: responseChildCategories } =
    useRequest();

  useEffect(() => {
    if (responseChildCategories) {
      const { id, category } = responseChildCategories;

      setChildCategories((prev) => ({ ...prev, [id]: category }));

      let values;

      if (filter.values) {
        values = [...filter.values, ...category];
      } else {
        values = category;
      }

      setFilter({
        _id: "categoryOne",
        name: "Other Categories",
        values,
        key: 0,
      });
    }
  }, [responseChildCategories]);

  const subCategoryHandler = (id, isChecked) => {
    if (isChecked) {
      requestChildCategories("POST", "v1/product-categories/child-categories", {
        id,
      });
    } else {
      const newChildCategories = { ...childCategories };
      newChildCategories[id].forEach((key) => {
        unregister(`dynamicCategory.categoryOne_${key._id}`);
      });

      setFilter({
        _id: "categoryOne",
        name: "Other Categories",
        values: filter.values.filter(
          (b) => newChildCategories[id].indexOf(b) === -1
        ),
        key: 0,
      });

      delete newChildCategories[id];
      setChildCategories(newChildCategories);
    }
  };

  return (
    <>
      {subCategories.length > 0 ? (
        <>
          <div className="accordion-item">
            <h2 className="accordion-header" id="flush-headingOne">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#flush-collapseOne"
                aria-expanded="false"
                aria-controls="flush-collapseOne"
              >
                {t("Sub Category")}
              </button>
            </h2>
            <div
              id="flush-collapseOne"
              className="accordion-collapse collapse"
              aria-labelledby="flush-headingOne"
              data-bs-parent="#accordionFlushExample"
            >
              <div className="accordion-body">
                <div className="stock-checkBox">
                  {subCategories.map((subCategory) => (
                    <div key={subCategory._id} className="form-check">
                      <div className="custom_checkbox position-relative check-type2">
                        {/* <input
                        className="form-check-input"
                        type="checkbox"
                        defaultValue=""
                        id={subCategory._id}
                        {...register(`subCategories.${subCategory._id}`)}
                      /> */}
                        <Controller
                          control={control}
                          name={`subCategories.${subCategory._id}`}
                          render={({ field: { onChange, value, ref } }) => {
                            return (
                              <input
                                className="form-check-input"
                                type="checkbox"
                                defaultValue=""
                                id={subCategory._id}
                                onChange={(val) => {
                                  subCategoryHandler(
                                    subCategory._id,
                                    val.target.checked
                                  );
                                  onChange(val);
                                }}
                                value={value}
                              />
                            );
                          }}
                        />
                      </div>
                      <label
                        className="form-check-label"
                        htmlFor={subCategory._id}
                      >
                        {subCategory.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {filter.values?.length > 0 && (
            <DynamicCategory
              filter={filter}
              register={register}
              control={control}
              unregister={unregister}
            />
          )}
        </>
      ) : null}
    </>
  );
};
