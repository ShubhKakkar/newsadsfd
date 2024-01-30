import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import { API } from "../../constant/api";

const apiName = "customer";
const titleSingular = "Customer";
const titlePlural = "Customers";

const Edit = (props) => {
  const { id } = props.match.params;
  const history = useHistory();
  const imgArray = ["image/png", "image/jpeg", "image/jpg"];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm();

  const { response: responseFetchUser, request: requestFetchSeeker } =
    useRequest();

  const { response, request } = useRequest();
  const { response: responseCountries, request: requestCountries } =
    useRequest();

  const [allCountry, setAllCountry] = useState([]);

  const [image, setImage] = useState("");
  const [isProfilePicRemove, setIsProfilePicRemove] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState();

  useEffect(() => {
    if (id) {
      requestFetchSeeker("GET", `${apiName}/${id}`);
      document.title = `Edit ${titleSingular} - Noonmar`;
      requestCountries("GET", `country/all?page=1&isActive=${true}`);
    }
  }, [id]);

  useEffect(() => {
    if (responseFetchUser) {
      const {
        firstName,
        lastName,
        email,
        contact,
        country,
        profilePic,
        zipCode,
        dob,
      } = responseFetchUser.customer;
      if (profilePic) {
        setImage(`${API.PORT}/${profilePic}`);
      }
      setValue("firstName", firstName);
      setValue("lastName", lastName);
      if (email) {
        setValue("email", email);
      }
      setValue("contact", contact);
      setValue("zipCode", zipCode);
      setValue("dob", moment(dob).format("YYYY-MM-DD"));
      setValue("country", country?._id ? country._id : "");
      setSelectedCountry(country?._id ? country._id : "");
    }
  }, [responseFetchUser]);

  useEffect(() => {
    if (response) {
      toast.success("Customer has been updated successfully.");
      history.push("/customers");
    }
  }, [response]);

  useEffect(() => {
    if (responseCountries) {
      if (responseCountries.status && responseCountries.data) {
        setAllCountry(responseCountries.data);
      }
    }
  }, [responseCountries]);

  const displayImageHandler = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
    setIsProfilePicRemove(false);
  };
  const handleRemoveMedia = () => {
    setIsProfilePicRemove(true);
    setValue("profilePic", "");
    setImage("");
  };

  const onSubmit = (data) => {
    const {
      firstName,
      lastName,
      email,
      contact,
      country,
      profilePic,
      zipCode,
      dob,
    } = data;
    // return;
    const formData = new FormData();
    formData.append("lastName", lastName);
    formData.append("firstName", firstName);
    formData.append("email", email);
    formData.append("country", country);
    formData.append("contact", contact);
    formData.append("zipCode", zipCode);
    formData.append("dob", dob);
    formData.append("userId", id);
    formData.append("isProfilePicRemove", isProfilePicRemove);

    if (profilePic && profilePic[0]) {
      const profilePicType = profilePic[0].type;
      if (!imgArray.includes(profilePicType)) {
        toast.error("Please select inage only in profile pic");
        return;
      } else {
        formData.append("profilePic", profilePic[0]);
      }
    }

    request("PUT", apiName, formData);
  };

  const handleChangeCountry = (countryId) => {
    setSelectedCountry(countryId);
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "First Name",
        type: "text",
        name: "firstName",
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "First name can only contain letters.",
        // },
      },
      {
        Component: Input,
        label: "Last Name",
        type: "text",
        name: "lastName",
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "Last name can only contain letters.",
        // },
      },
      {
        Component: Input,
        label: "Email",
        type: "email",
        name: "email",
        registerFields: {
          required: false,
          pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        },
        registerFieldsFeedback: {
          pattern: "The email field must be a valid email address.",
        },
      },
      {
        Component: Input,
        label: "Contact Number",
        type: "number",
        name: "contact",
        registerFields: {
          required: true,
          pattern: /^[0-9]{10}$/gm,
          // setValueAs: (v) => v.trim(),
        },
        registerFieldsFeedback: {
          pattern: "The contact field must be a valid contact number.",
        },
      },

      {
        Component: Input,
        label: "DOB",
        type: "date",
        name: "dob",
        registerFields: {
          required: false,
          // setValueAs: (v) => v.trim(),
        },
        inputData: {
          max: moment().format("YYYY-MM-DD"),
        },
        registerFieldsFeedback: {
          // pattern: "The zip code field must be a valid zip code.",
        },
      },
      {
        Component: SelectInput,
        label: "Country",
        name: "country",
        registerFields: {
          required: true,
        },
        children: allCountry && allCountry.length > 0 && (
          <>
            <option value="">{"Select an option"}</option>
            {allCountry.map((obj) => (
              <option key={obj._id} value={obj._id}>
                {" "}
                {obj.name}
              </option>
            ))}
          </>
        ),
        onChange: handleChangeCountry,
        isEdit: true,
        defaultValue: selectedCountry,
      },
      {
        Component: Input,
        label: "Profile Pic",
        type: "file",
        name: "profilePic",
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
      {
        Component: Input,
        label: "Zip Code",
        type: "number",
        name: "zipCode",
        registerFields: {
          required: false,
          pattern: /^[0-9]{6}$/gm,
          setValueAs: (v) => v.trim(),
        },
        registerFieldsFeedback: {
          pattern: "The zip code field must be a valid zip code.",
        },
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Customer"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/customers" /*backPageNum: page */ },
            name: "Back To Customers",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Edit Customer</h3>
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
                      name="Update"
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
