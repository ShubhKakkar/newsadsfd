import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment";

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
    setError,
    setValue,
    control,
  } = useForm();
  const imgArray = ["image/png", "image/jpeg", "image/jpg"];

  const { response, request } = useRequest();
  const { response: responseCountries, request: requestCountries } =
    useRequest();
  const { response: responseGroups, request: requestGroups } = useRequest();

  const [allCountry, setAllCountry] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groups, setGroups] = useState([]);
  const [image, setImage] = useState("");

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Home Page Permission - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Home Page Permission has been added successfully.");
      history.push("/home-page-permission");
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
    if (responseGroups) {
      if (responseGroups.status) {
        setGroups(responseGroups.groups);
      }
    }
  }, [responseGroups]);

  const displayImageHandler = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };
  const handleRemoveMedia = () => {
    setValue("image", "");
    setImage("");
  };

  const onSubmit = (data) => {
    const { name, image } = data;
    const formData = new FormData();

    formData.append("name", name);
    if (image && image[0]) {
      const imageType = image[0].type;
      if (!imgArray.includes(imageType)) {
        toast.error("Please select image");
        return;
      } else {
        formData.append("image", image[0]);
      }
    }

    request("POST", "master/home/page-permission", formData);
  };

  const InputFields = [
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
        //   pattern: "First Name can only contain letters.",
        // },
      },

      {
        Component: Input,
        label: "Image",
        type: "file",
        name: "image",
        registerFields: {
          required: false,
          setValueAs: (v) => v.trim(),
        },
        registerFieldsFeedback: {
          // pattern: "The zip code field must be a valid zip code.",
        },
        handleMedia: displayImageHandler,
        isMedia: true,
        accept: ".png, .jpg, .jpeg",
        control,
        children: image && (
          <>
            <img
              src={image}
              width={150}
              height={100}
              alt=""
              style={{ cursor: "pointer", marginBottom: "10px" }}
              data-fancybox
            />
            <Link to="#" onClick={handleRemoveMedia} className="mx-3">
              Remove
            </Link>
          </>
        ),
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Home Page Permission"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/home-page-permission", name: "Back To Home Page Permission" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Add New Home Page Permission</h3>
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
