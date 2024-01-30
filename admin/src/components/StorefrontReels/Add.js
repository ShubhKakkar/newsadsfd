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
} from "../Form/Form";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
  } = useForm();

  const { response, request } = useRequest();
  const history = useHistory();
  const [allVendors, setAllVendors] = useState([]);
  const { response: responseVendors, request: requestVendors } = useRequest();

  useEffect(() => {
    document.title = "Add Storefront Reel - Noonmar";
    requestVendors("GET", `vendor/all?page=1&isActive=${true}`);
  }, []);

  useEffect(() => {
    if (responseVendors) {
      setAllVendors(responseVendors.vendors);
    }
  }, [responseVendors]);

  useEffect(() => {
    if (response) {
      toast.success("Reel has been added successfully.");
      history.push("/storefront-reels");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { video, vendor } = data;

    let fd = new FormData();
    fd.append("vendor", vendor);
    fd.append("type", "storefront");
    if (video) {
      fd.append("video", video[0]);
    }
    request("POST", "reel", fd);
  };

  const handleVideo = (event) => {
    event.preventDefault();
    setError("video", "");
  };

  const InputFields = [
    [
      {
        Component: SelectInput,
        label: "Vendor",
        name: "vendor",
        registerFields: {
          required: true,
        },
        children: allVendors && allVendors.length > 0 && (
          <>
            <option value="">{"Select vendor"}</option>
            {allVendors.map((obj) => (
              <option key={obj._id} value={obj._id}>
                {" "}
                {obj.businessName}
              </option>
            ))}
          </>
        ),
      },
      {
        Component: Input,
        label: "Video",
        type: "file",
        name: "video",
        registerFields: {
          required: true,
        },
        handleMedia: handleVideo,
        isMedia: true,
        accept: ".mp4",
        control,
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Storefront Reel"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/storefront-reels", name: "Back To Storefront Reels" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-xl-1"></div>
                <div className="col-xl-10">
                  <h3 className="mb-10 font-weight-bold text-dark">
                    Add New Reel
                  </h3>

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
