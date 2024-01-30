import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Modal from "react-modal";
import Brand from "../Brand/Add.js";
import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  SelectInput,
  RenderInputFields,
  SubmitButton,
  ReactSelectInput,
  CreatableReactSelectInput,
  MultiReactSelectInput,
  ButtonComp,
} from "../Form/Form";

const Edit = (props) => {
  const { id: recordId } = props.match.params;
  const history = useHistory();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    control,
    watch,
  } = useForm();

  const { response: responseFetchUser, request: requestFetchSeeker } =
    useRequest();
  const { response, request } = useRequest();
  // const { response: responseVendors, request: requestVendors } = useRequest();
  const { response: responseCountries, request: requestCountries } =
    useRequest();
  const { response: responseBrands, request: requestBrands } = useRequest();

  const [allCountry, setAllCountry] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState();
  // const [selectedVendor, setSelectedVendor] = useState();
  // const [selectedBrand, setSelectedBrand] = useState();
  // const [allVendors, setAllVendors] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [modelOpen, setModelOpen] = useState(false);
  const [newBrand, setNewBrand] = useState(null);

  useEffect(() => {
    if (recordId) {
      requestFetchSeeker("GET", `manufacture/${recordId}`);
      requestCountries("GET", `country/all?page=1&isActive=${true}`);
      // requestVendors("GET", `vendor/all?page=1&isActive=${true}&per_page=100`);
      requestBrands("GET", `brand/all?page=1&isActive=${true}&per_page=100`);
      document.title = "Edit Manufacture - Noonmar";
    }
  }, [recordId]);

  // useEffect(() => {
  //   if (responseVendors) {
  //     if (responseVendors.status && responseVendors.vendors) {
  //       setAllVendors(responseVendors.vendors);
  //     }
  //   }
  // }, [responseVendors]);

  useEffect(() => {
    if (responseCountries) {
      if (responseCountries.status && responseCountries.data) {
        setAllCountry(responseCountries.data);
      }
    }
  }, [responseCountries]);

  useEffect(() => {
    if (newBrand) {
      const isAlreadyAdded = allBrands.find(
        (b) => b.label === newBrand.label.trim()
      );

      if (isAlreadyAdded) {
        setNewBrand(null);
        return;
      }

      const selectedBrands = watch("brands");
      if (selectedBrands) {
        setValue("brands", [...selectedBrands, newBrand]);
      } else {
        setValue("brands", [newBrand]);
      }
      setAllBrands((prev) => [...prev, newBrand]);
      setNewBrand(null);
    }
  }, [newBrand]);

  useEffect(() => {
    if (responseBrands) {
      if (responseBrands.status && responseBrands.brands) {
        setAllBrands(
          responseBrands.brands.map((brand) => ({
            label: brand.name,
            value: brand._id,
          }))
        );
      }
    }
  }, [responseBrands]);

  useEffect(() => {
    if (responseFetchUser) {
      const { industry, name, employees, country, vendor, brands } =
        responseFetchUser?.data;
      setSelectedCountry(country?._id);
      // setSelectedVendor(vendor?._id);
      // setSelectedBrand(brand?._id);
      setValue("name", name);
      setValue("industry", industry);
      setValue("employees", employees);
      setValue("location", country?._id);
      // setValue("vendor", vendor?._id);
      // setValue("brand", brand?._id);
      setValue(
        "brands",
        brands.map((b) => ({
          label: b.name,
          value: b._id,
        }))
      );
    }
  }, [responseFetchUser]);

  useEffect(() => {
    if (response) {
      toast.success("Manufacture has been updated successfully.");
      history.push("/manufactures");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { name, industry, location, employees, brands } = data;

    let oldBrands = [];
    let newBrands = [];

    brands.forEach((b) => {
      if (b.langData) {
        newBrands.push(b);
      } else {
        oldBrands.push(b.value);
      }
    });

    request("PUT", "manufacture", {
      name,
      industry,
      employees,
      location,
      // vendor,
      // brands: brands.filter((b) => !b.__isNew__).map((b) => b.value),
      // newBrands: brands.filter((b) => b.__isNew__).map((b) => b.value),
      brands: oldBrands,
      newBrands: newBrands,
      id: recordId,
    });
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Name",
        type: "name",
        name: "name",
        registerFields: {
          required: true,
        },
      },
      {
        Component: Input,
        label: "Industry",
        type: "industry",
        name: "industry",
        registerFields: {
          required: true,
        },
      },
      //   {
      //     Component: Input,
      //     label: "Employees",
      //     type: "employees",
      //     name: "employees",
      //     registerFields: {
      //       required: true,
      //       pattern: /^[0-9]+$/,
      //     },
      //     registerFieldsFeedback: {
      //         pattern: "Employees can only contain numbers.",
      //       },
      //   },
      {
        Component: SelectInput,
        label: "Employees",
        name: "employees",
        registerFields: {
          required: true,
        },
        children: (
          <>
            <option value="">{"Select employee"}</option>
            <option value={"0-50"}> 0-50</option>
            <option value={"51-100"}> 51-100</option>
            <option value={"101-150 "}> 101-150 </option>
            <option value={"151-200 "}> 151-200 </option>
            <option value={" 200+"}> 200+ </option>
          </>
        ),
      },
      {
        Component: SelectInput,
        label: "Location",
        name: "location",
        registerFields: {
          required: true,
        },
        children: allCountry && allCountry.length > 0 && (
          <>
            <option value="">{"Select an option"}</option>
            {allCountry.map((obj) => (
              <option
                key={obj._id}
                selected={selectedCountry == obj._id ? "selected" : ""}
                value={obj._id}
              >
                {" "}
                {obj.name}
              </option>
            ))}
          </>
        ),
      },
      // {
      //   Component: SelectInput,
      //   label: "Vendor",
      //   name: "vendor",
      //   registerFields: {
      //     required: true,
      //   },
      //   children: allVendors && allVendors.length > 0 && (
      //     <>
      //       <option value="">{"Select an option"}</option>
      //       {allVendors.map((obj) => (
      //         <option
      //           key={obj._id}
      //           selected={selectedVendor == obj._id ? "selected" : ""}
      //           value={obj._id}
      //         >
      //           {" "}
      //           {obj?.businessName}
      //         </option>
      //       ))}
      //     </>
      //   ),
      // },
      // {
      //   Component: SelectInput,
      //   label: "Brand",
      //   name: "brand",
      //   registerFields: {
      //     required: true,
      //   },
      //   children: allBrands && allBrands.length > 0 && (
      //     <>
      //       <option value="">{"Select an option"}</option>
      //       {allBrands.map((obj) => (
      //         <option
      //           key={obj._id}
      //           selected={selectedBrand == obj._id ? "selected" : ""}
      //           value={obj._id}
      //         >
      //           {" "}
      //           {obj?.name}
      //         </option>
      //       ))}
      //     </>
      //   ),
      // },
      {
        Component: MultiReactSelectInput,
        label: "Brands",
        name: "brands",
        registerFields: {
          required: false,
        },
        control,
        options: allBrands,
        isMultiple: true,
        colClass: "col-xl-5",
      },
      {
        Component: ButtonComp,
        children: "Add",
        onClick: () => setModelOpen(true),
        classes: "col-xl-1 btn btn-success font-weight-bold text-uppercase",
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Manufacture"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/manufactures" /*backPageNum: page */ },
            name: "Back To Manufactures",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Edit Manufacture</h3>
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
                    {/* <button
                      className="btn btn-success font-weight-bold new-class text-uppercase px-8 py-3"
                      onClick={() => setModelOpen(true)}
                      type="button"
                    >
                      Add
                    </button> */}
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
      <Modal
        isOpen={modelOpen}
        onRequestClose={() => setModelOpen(false)}
        ariaHideApp={false}
        // className="model_block"
        // size="lg"
        // style={{ width: "1000px" }}
        className="modal-dialog-scrollable react_modal_custom small_popup react_Custom_modal"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Brand Add</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setModelOpen(false)}
            >
              <i aria-hidden="true" className="ki ki-close"></i>
            </button>
          </div>
          <div>
            {/* className="modal-body" */}
            <Brand
              isAnotherComponent={true}
              setModelOpen={setModelOpen}
              setBrands={setNewBrand}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Edit;
