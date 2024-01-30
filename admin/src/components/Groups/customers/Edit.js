import React, { useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
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
} from "../../Form/Form";
import { API } from "../../../constant/api";

const Edit = (props) => {
  const { id } = props.match.params;
  const history = useHistory();

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

  const { response, request } = useRequest();

  const { response: responseMembers, request: requestMembers } = useRequest();

  useEffect(() => {
    if (id) {
      document.title = "Edit Customer Group - Noonmar";
      requestVendor("GET", "customer/get-all-customers");
     
    }
  }, [id]);

  useEffect(() => {
    if (responseVendor) 

      {
      if (responseVendor.status && responseVendor.customers) {
        requestMembers("GET", `group/customer/${id}`);
        setAllMembers(
          responseVendor.customers.map((data) => ({
            label: data.label,
            value: data._id,
          }))
        );
      }
    }
  }, [responseVendor]);

  useEffect(() => {
    if (responseMembers)

    {
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

      toast.success("Customer Group updated successfully.");
      history.push("/group/customers");
    }
  }, [response]);

  const onSubmit = (data) => {
    let { name, members } = data;

    request("PUT", "group/update/customer", {
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
            to: { pathname: "/group/customers" /*backPageNum: page */ },
            name: "Back To Customer Group",
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
