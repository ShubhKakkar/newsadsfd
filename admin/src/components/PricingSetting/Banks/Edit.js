import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useRequest from "../../../hooks/useRequest";
import Breadcrumb from "../../Breadcrumb/Breadcrumb";
import GooglePlace from "../../GooglePlace/GooglePlace";
import {
  Input,
  Textarea,
  SelectInput,
  RenderInputFields,
  SubmitButton,
} from "../../Form/Form";

const Edit = (props) => {
  const { id: recordId } = props.match.params;
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    watch,
  } = useForm();

  const { address } = watch();

  const { response: responseFetchUser, request: requestFetchSeeker } =
    useRequest();

  const { response, request } = useRequest();
  const { response: responseCountries, request: requestCountries } =
    useRequest();

  const [allCountry, setAllCountry] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState();

  useEffect(() => {
    if (recordId) {
      requestFetchSeeker("GET", `bank/${recordId}`);
      document.title = "Edit Bank - Noonmar";
      requestCountries("GET", `country/all?page=1&isActive=${true}`);
    }
  }, [recordId]);

  useEffect(() => {
    if (responseFetchUser) {
      const { name, geoLocation, address, information, country } =
        responseFetchUser.banks;

      setValue("name", name);
      setValue("information", information);
      setSelectedCountry(country);
      setValue("country", country);
      setValue("address", address);
      setValue("geoLocation", geoLocation?.coordinates);
    }
  }, [responseFetchUser]);

  useEffect(() => {
    if (response) {
      toast.success("Bank updated successfully.");
      history.push("/pricing-setting/banks");
    }
  }, [response]);

  useEffect(() => {
    if (responseCountries) {
      if (responseCountries.status && responseCountries.data) {
        setAllCountry(responseCountries.data);
      }
    }
  }, [responseCountries]);

  // useEffect(() => {
  //   if (responseVendors) {
  //     if (responseVendors.status && responseVendors.vendors) {
  //       setAllVendors(responseVendors.vendors);
  //     }
  //   }
  // }, [responseVendors]);

  const onSubmit = (data) => {
    const { name, address, geoLocation, information, country } = data;
    if (!address) {
      setError("address", {
        type: "manual",
      });
      return;
    }

    if (!geoLocation) {
      setError("address", {
        type: "manual1",
      });
      return;
    }

    request("PUT", "bank", {
      name,
      id: recordId,
      // vendor,
      country,
      information,
      address,
      geoLocation: {
        type: "Point",
        coordinates: geoLocation,
      },
    });
  };

  const handleChangeCountry = (countryId) => {
    setSelectedCountry(countryId);
  };

  const saveAddressHandler = (address, geoLocation, key) => {
    clearErrors("address");
    setValue("address", address);
    setValue("geoLocation", [geoLocation.lng, geoLocation.lat]);
  };

  const getCurrentLocationHandler = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition();
    }
  };
  const InputFields = [
    [
      {
        Component: Input,
        label: "Bank Name",
        type: "text",
        name: "name",
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "Bank name can only contain letters.",
        // },
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
        Component: Textarea,
        label: "Information",
        type: "text",
        name: "information",
        registerFields: {
          required: true,
        },
        colClass: "col-xl-12",
      },
    ],
  ];
  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Bank"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/pricing-setting/banks" /*backPageNum: page */ },
            name: "Back To Banks",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Edit Bank</h3>
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

                    <div className="form-group">
                      <div className="position-relative">
                        <label>Location</label>
                        <GooglePlace
                          saveAddress={saveAddressHandler}
                          index={0}
                          defaultAddress={address}
                        />
                        {errors.address?.type === "manual" && (
                          <p className="error-msg">
                            The address field is required.
                          </p>
                        )}
                        {errors.address?.type === "manual1" && (
                          <p className="error-msg">
                            The address field is invalid.
                          </p>
                        )}
                        <span
                          className="inputicon"
                          onClick={getCurrentLocationHandler}
                        ></span>
                      </div>
                    </div>

                    <div className="row"></div>

                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmit}
                      name="Update"
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
