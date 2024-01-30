import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Modal from "react-modal";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  RenderInputFields,
  SubmitButton,
  ReactSelectInput,
} from "../Form/Form";
import { SubTab, SubInput } from "../LanguageForm/LanguageForm";

const Edit = (props) => {
  const { id: specificationId } = props.match.params;
  const history = useHistory();

  const { languages } = useSelector((state) => state.setting);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    reset,
    getValues,
    trigger,
    clearErrors,
    control,
  } = useForm();

  const { response: responseFetchUser, request: requestFetchSeeker } =
    useRequest();

  const { response: responseCountries, request: requestCountries } =
    useRequest();

  const { response, request } = useRequest();
  const [langDataIds, setLangDataIds] = useState([]);

  useEffect(() => {
    if (specificationId) {
      document.title = "Edit Specification Groups - Noonmar";
    }
  }, [specificationId]);

  useEffect(() => {
    if (languages) {
      requestFetchSeeker("GET", `specification-groups/${specificationId}`);
    }
  }, [languages]);

  useEffect(() => {
    if (responseFetchUser) {
      const {
        data: { name = [] },
        languageData,
      } = responseFetchUser.data;

      const { variants } = responseFetchUser;

      const subData = {};

      setLangDataIds(languageData);
      languageData.forEach((lang) => {
        const code = lang.languageCode;
        subData["name-" + code] = lang.name;
      });

      reset({ name, ...subData });
    }
  }, [responseFetchUser]);

  useEffect(() => {
    if (response) {
      toast.success("Specification Groups has been updated successfully.");
      history.push("/specification-groups");
    }
  }, [response]);

  const onSubmit = (data) => {
    // const { country, commissionRate } = data;
    const dataToSend = [];

    let fd = new FormData();
    fd.append("id", specificationId);

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      const lang = langDataIds.find((obj) => {
        if (obj.languageCode == code) {
          return obj.id;
        }
      });

      dataToSend.push({
        name: data["name-" + code] ?? "",
        id: lang && lang.id ? lang.id : "",
      });

      if (languages[i].default) {
        fd.append("name", data["name-" + code]);
      }
    }

    fd.append("data", JSON.stringify(dataToSend));

    request("PUT", "specification-groups", fd);
  };

  // const InputFields = [
  //   [
  //   ],
  // ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Specification Groups"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/specification-groups" /*backPageNum: page */ },
            name: "Back To Specification Groups",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Edit Specification Groups</h3>
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
                                isEdit={true}
                              />
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* <RenderInputFields
                      InputFields={InputFields}
                      errors={errors}
                      register={register}
                    /> */}

                    <div className="row"></div>
                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmit}
                      name="Update"
                      pxClass="px-10"
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
