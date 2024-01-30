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
    document.title = "Add Customer - Noonmar";
    requestCountries("GET", `country/all?page=1&isActive=${true}`);
    requestGroups("GET", "group/customer");
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Customer has been added successfully.");
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
    setValue("profilePic", "");
    setImage("");
  };

  const onSubmit = (data) => {
    const {
      firstName,
      lastName,
      email,
      country,
      contact,
      zipCode,
      dob,
      profilePic,
      group,
    } = data;
    const formData = new FormData();
    console.log(group);
    formData.append("lastName", lastName);
    formData.append("firstName", firstName);
    formData.append("email", email);
    formData.append("country", country);
    formData.append("contact", contact);
    formData.append("zipCode", zipCode);
    formData.append("dob", dob);
    if (group) {
      formData.append("group", group);
    }

    if (profilePic && profilePic[0]) {
      const profilePicType = profilePic[0].type;
      if (!imgArray.includes(profilePicType)) {
        toast.error("Please select inage only in profile pic");
        return;
      } else {
        formData.append("profilePic", profilePic[0]);
      }
    }

    request("POST", "customer/create", formData);
  };

  const handleChangeGroup = (event) => {
    setSelectedGroup(event);
    // if (event && event.length > 0) {
    //   let countryids = event.map((obj) => obj.value);
    //   setError("serveCountries", "");
    //   setValue("serveCountries", countryids);
    // } else {
    //   setValue("serveCountries", null);
    // }
    setValue("group", event.value);
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
        //   pattern: "First Name can only contain letters.",
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
        //   pattern: "Last Name can only contain letters.",
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
          setValueAs: (v) => v.trim(),
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
          setValueAs: (v) => v.trim(),
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
          setValueAs: (v) => v.trim(),
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
      {
        Component: ReactSelectInput,
        label: "Group",
        type: "text",
        name: "group",
        options: groups,
        registerFields: {
          required: false,
          // pattern: /^[A-Za-z ]+$/,
        },
        handleChange: handleChangeGroup,
        selectedOption: selectedGroup,
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Customer"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/customers", name: "Back To Customers" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Add New Customer</h3>
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
