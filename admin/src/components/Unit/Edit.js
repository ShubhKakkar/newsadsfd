import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, RenderInputFields, SubmitButton } from "../Form/Form";

import { debounce } from "../../util/fn";

import { SubTab, SubInput } from "../LanguageForm/LanguageForm";
import useRequestTwo from "../../hooks/useRequestTwo";

const Edit = (props) => {
  const { id: unitId } = props.match.params;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm();
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);

  const { languages } = useSelector((state) => state.setting);
  const { response, request } = useRequest();
  const [langDataIds, setLangDataIds] = useState([]);

  const { response: responseGetOne, request: requestGetOne } = useRequest();
  const { request: requestPromiseCategories } = useRequestTwo();

  const history = useHistory();

  useEffect(() => {
    if (unitId) document.title = "Edit Unit - Noonmar";

    // requestGetOne("GET", `unit/${id}`);
  }, [unitId]);

  useEffect(() => {
    if (languages) {
      requestGetOne("GET", `unit/${unitId}`);
    }
  }, [languages]);


  // useEffect(() => {
  //   if (responseGetOne) {
  //     const { code, name, sign } = responseGetOne.unit;
  //     reset({ code, name, sign });
  //   }
  // }, [responseGetOne]);

  useEffect(() => {
    if (responseGetOne) {
      const {
        data: { name = [] },
        languageData,
      } = responseGetOne.unit;

      const { variants } = responseGetOne;


      const subData = {};

      setLangDataIds(languageData);
      languageData.forEach((lang) => {
        const code = lang.languageCode;
        subData["name-" + code] = lang.name;
      });

      reset({ name, ...subData });
    }
  }, [responseGetOne]);


  useEffect(() => {
    if (response) {
      toast.success("Unit has been updated successfully.");
      history.push("/units");
    }
  }, [response]);

  const onSubmit = (data) => {
    // const { name, code, sign } = data;

    const dataToSend = [];
    let name;
    let id;

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      const lang = langDataIds.find((obj) => {
        if (obj.languageCode == code) {
          return obj.id;
        }
      });

      dataToSend.push({
        languageCode: code,
        name: data["name-" + code] ?? "",
        id: lang && lang.id ? lang.id : "",
      });

      if (languages[i].default) {
        name = data["name-" + code];
      }
    }

    request("PUT", "unit", { name, id: unitId, data: dataToSend });
  };

  const categoryChangeHandler = (e) => {
    setSelectedSubCategories(e);
    setValue("subCategories", e);
  };

  const loadOptionsDebounced = useCallback(
    debounce(async (inputValue, callback) => {
      const response = await requestPromiseCategories(
        "GET",
        `unit/sub-categories?name=${inputValue}`
      );
      callback(
        response.data.data.map((sc) => ({ value: sc._id, label: sc.name }))
      );
    }, 500),
    []
  );

  //    request("PUT", "unit", { name, code, sign, id });
  // };

  // const InputFields = [
  //   [
  //     {
  //       Component: Input,
  //       label: "Unit Name",
  //       type: "text",
  //       name: "name",
  //       registerFields: {
  //         required: true,
  //         // pattern: /^[A-Za-z ]+$/,
  //       },
  //       // registerFieldsFeedback: {
  //       //   pattern: "Unit Name can only contain letters.",
  //       // },
  //     },
  //   ],
  // ];
  const InputFields = [[]];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Unit"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/units", name: "Back To Units" },
        ]}
      />
      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Edit Unit</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="card card-custom gutter-b">
                      <div className="card-header card-header-tabs-line">
                        <div className="card-toolbar">
                          <ul
                            className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                            role="tablist"
                          >
                            {languages.length > 0 &&
                              languages.map((lang, index) => (
                                <SubTab
                                  key={index}
                                  name={lang.name}
                                  index={index}
                                  image={lang?.image}
                                />
                              ))}
                          </ul>
                        </div>
                      </div>

                      <div className="card-body px-0">
                        <div className="tab-content px-10">
                          {languages.length > 0 &&
                            languages.map((lang, index) => (
                              <SubInput
                                key={index}
                                index={index}
                                errors={errors}
                                register={register}
                                getValues={getValues}
                                setValue={setValue}
                                trigger={trigger}
                                required={lang.required}
                                titleName={"name-" + lang.code}
                                titleLabel={"Name"}
                                clearErrors={clearErrors}
                                isEdit={false}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
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
                      pxClass="px-10"
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Edit New Unit</h3>
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
      </div> */}
    </div>
  );
};

export default Edit;
