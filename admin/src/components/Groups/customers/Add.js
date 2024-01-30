import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment";

import useRequest from "../../../hooks/useRequest";
import Breadcrumb from "../../Breadcrumb/Breadcrumb";
import GooglePlace from "../../GooglePlace/GooglePlace";
import {
  Input,
  SelectInput,
  RenderInputFields,
  SubmitButton,
  ReactSelectInput,
  CreatableReactSelectInput,
} from "../../Form/Form";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    unregister,
    watch,
    clearErrors,
    control,
  } = useForm();

  const [allMember, setAllMember] = useState([]);

  const [selectedMember, setSelectedMember] = useState([]);

  const { response, request } = useRequest();
  const { response: responseMembers, request: requestMembers } = useRequest();

  const history = useHistory();

  useEffect(() => {
    document.title = "Add New Group - Noonmar";
    requestMembers("GET", `customer/get-all-customers`);
  }, []);

  useEffect(() => {
    if (responseMembers) {
      if (responseMembers.status && responseMembers.customers) {
        setAllMember(
          responseMembers.customers.map((data) => ({
            label: data.label,
            value: data._id,
          }))
        );
      }
    }
  }, [responseMembers]);

  useEffect(() => {
    if (response) {
      toast.success("Customer Group added successfully.");
      history.push("/group/customers");
    }
  }, [response]);

  const handleChangeMembers = (event) => {
    setSelectedMember(event);
    if (event && event.length > 0) {
      let memberids = event.map((obj) => obj.value);
      setError("members", "");
      setValue("members", memberids);
    } else {
      setValue("members", null);
    }
  };

  const onSubmit = (data) => {
    let { members, name } = data;
    request("POST", "group/add/customer", {
      name,
      members,
    });
  };

  const InputFieldsOtherDetail = [
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
        //   pattern: "Name can only contain letters.",
        // },
      },

      {
        Component: ReactSelectInput,
        label: "Members",
        type: "text",
        name: "members",
        options: allMember,
        isMultiple: true,
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        handleChange: handleChangeMembers,
        selectedOption: selectedMember,
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add New Group"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/group/customers", name: "Back To Customer Group" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div className="card-header">
              <h3 className="card-title">Add New Group</h3>
            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <RenderInputFields
                      InputFields={InputFieldsOtherDetail}
                      errors={errors}
                      register={register}
                    />

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

export default Add;
