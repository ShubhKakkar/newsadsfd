import React, { useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import moment from "moment";

import {
  getEntityTextONE,
  getEntityTextTWO,
  getEntity,
  getEntityTitle,
  getentityTypeKey,
} from "../../util/fn";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import GooglePlace from "../GooglePlace/GooglePlace";
import {
  Input,
  SelectInput,
  RenderInputFields,
  SubmitButton,
  ReactSelectInput,
} from "../Form/Form";
import { API } from "../../constant/api";

const Edit = (props) => {
  const { id, entityType } = props.match.params;
  const history = useHistory();
  console.log("et", entityType);
  //const entity = getEntity(entityType);
  const entityTitle = getEntityTitle(entityType);
  const entityTextOne = getEntityTextONE(entityType);
  const entityTextTwo = getEntityTextTWO(entityType);
  const entityTypeKey = getentityTypeKey(entityType);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    unregister,
    setError,
    control,
    clearErrors,
  } = useForm();

  const [allMembers, setAllMembers] = useState([]);
  const [selectedMembers, setSElectedMembers] = useState([]);
  const { response: responseVendor, request: requestVendor } = useRequest();
  console.log(responseVendor);
  const { response, request } = useRequest();

  const { response: responseMembers, request: requestMembers } = useRequest();

  useEffect(() => {
    if (id) {
      document.title = `Edit ${entityTextTwo} Group - Noonmar`;

      entityType === "vendor"
        ? requestVendor("GET", "vendor/get-all-vendor")
        : entityType === "customer"
        ? requestVendor("GET", "customer/get-all-customers")
        : entityType === "country"
        ? requestVendor("GET", "country/get-all-countries")
        : entityType === "product"
        ? requestVendor("GET", "product/get-all-products")
        : requestVendor("GET", "manufacture/get-all-supplier-manufactures");
    }
  }, [id]);

  useEffect(() => {
    // const entityResponse =
    // entityType === "vendor"
    //   ? "vendor"
    //   : entityType === "customer"
    //   ? "customers"
    //   : entityType === "country"
    //   ? "countries"
    //   : entityType === "product"
    //   ? "products"
    //   : "manufactures";

    if (responseVendor) {
      if (responseVendor.status && responseVendor[entityTypeKey]) {
        requestMembers(
          "GET",
          `group/${
            entityType === "vendor"
              ? "vendor"
              : entityType === "customer"
              ? "customer"
              : entityType === "country"
              ? "country"
              : entityType === "product"
              ? "product"
              : "supplier"
          }/${id}`
        );
        setAllMembers(
          responseVendor[entityTypeKey].map((data) => ({
            label: data.label,
            value: data._id,
          }))
        );
      }
    }
  }, [responseVendor]);

  useEffect(() => {
    if (responseMembers) {
      const { name, members } = responseMembers.data;

      setValue("name", name);
      setSElectedMembers(members);
      setValue(
        "members",
        members.map((m) => m.value)
      );
    }
  }, [responseMembers]);

  useEffect(() => {
    if (response) {
      toast.success(`${entityTextTwo} Group updated successfully.`);
      history.push(`/group/${entityTextOne}`);
    }
  }, [response]);

  const onSubmit = (data) => {
    let { name, members } = data;

    request("PUT", `group/update/${entityType}`, {
      name,
      members,
      id,
    });
  };

  const handleChangeMembers = (event) => {
    setSElectedMembers(event);
    if (event && event.length > 0) {
      let memberIds = event.map((obj) => obj.value);
      setError("members", "");
      setValue("members", memberIds);
    } else {
      setValue("members", null);
    }
  };

  const InputDetails = [
    [
      {
        Component: Input,
        label: "Name",
        type: "text",
        name: `name`,
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
          setValueAs: (v) => v.trim(),
        },
        // registerFieldsFeedback: {
        //   pattern: "Name can only contain letters.",
        // },
      },
      {
        Component: ReactSelectInput,
        label: "Members",
        type: "text",
        name: "members",
        options: allMembers,
        isMultiple: true,
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        handleChange: handleChangeMembers,
        selectedOption: selectedMembers,
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Group"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: `/group/${entityTextOne}` /*backPageNum: page */ },
            name: `Back To ${entityTextTwo} Groups`,
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Edit Group</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <RenderInputFields
                      InputFields={InputDetails}
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
                <div className="col-xl-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edit;
