import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
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
  CreatableReactSelectInput,
  MultiReactSelectInput,
  ReactSelectInput,
  ButtonComp,
} from "../Form/Form";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    control,
    watch,
  } = useForm();

  const { response, request } = useRequest();
  const { response: responseCountries, request: requestCountries } =
    useRequest();
  // const { response: responseVendors, request: requestVendors } = useRequest();
  const { response: responseBrands, request: requestBrands } = useRequest();
  const { response: responseGroups, request: requestGroups } = useRequest();

  const [allCountry, setAllCountry] = useState([]);
  // const [allVendors, setAllVendors] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [modelOpen, setModelOpen] = useState(false);
  const [newBrand, setNewBrand] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState("");

  const [selectedGroup, setSelectedGroup] = useState("");
  const [groups, setGroups] = useState([]);

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Manufacture - Noonmar";
    requestCountries("GET", `country/all?page=1&isActive=${true}`);
    // requestVendors("GET", `vendor/all?page=1&isActive=${true}&per_page=100`);
    requestBrands("GET", `brand/all?page=1&isActive=${true}&per_page=100`);
    requestGroups("GET", "group/supplier");
  }, []);

  // useEffect(() => {
  //   if (responseVendors) {
  //     if (responseVendors.status && responseVendors.vendors) {
  //       setAllVendors(responseVendors.vendors);
  //     }
  //   }
  // }, [responseVendors]);

  useEffect(() => {
    if (response) {
      toast.success("Manufacture has been added successfully.");
      history.push("/manufactures");
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
        setSelectedBrands([...selectedBrands, newBrand]);
      } else {
        setValue("brands", [newBrand]);
        setSelectedBrands([newBrand]);
      }
      setAllBrands((prev) => [...prev, newBrand]);
      setNewBrand(null);
    }
  }, [newBrand]);

  const onSubmit = (data) => {
    const { name, industry, employees, location, vendor, brands, groupId } =
      data;
    // console.log('data',data)
    let oldBrands = [];
    let newBrands = [];

    brands.forEach((b) => {
      if (b.langData) {
        newBrands.push(b);
      } else {
        oldBrands.push(b.value);
      }
    });

    request("POST", "manufacture", {
      name,
      industry,
      employees,
      location,
      // vendor,
      // brands: brands.filter((b) => !b.__isNew__).map((b) => b.value),
      // newBrands: brands.filter((b) => b.__isNew__).map((b) => b.value),
      brands: oldBrands,
      groupId,
      newBrands: newBrands,
    });

    console.log("data", data);
  };

  const handleChangeGroup = (event) => {
    setSelectedGroup(event);
    setValue("groupId", event.value);
  };

  const handleChangeBrands = (event) => {
    setSelectedBrands(event);
    setValue("brands", event);
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
              <option key={obj._id} value={obj._id}>
                {" "}
                {obj.name}
              </option>
            ))}
          </>
        ),
      },
      {
        Component: ReactSelectInput,
        label: "Brands",
        name: "brands",
        options: allBrands,
        registerFields: {
          required: false,
        },
        isMultiple: true,
        colClass: "col-xl-5",
        handleChange: handleChangeBrands,
        selectedOption: selectedBrands,
      },
      {
        Component: ButtonComp,
        children: "Add",
        onClick: () => setModelOpen(true),
        classes:
          "col-xl-1 btn btn-success font-weight-bold text-uppercase h-100 mt-8",
      },
      {
        Component: ReactSelectInput,
        label: "Group",
        name: "groupId",
        options: groups,
        registerFields: {
          required: false,
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
        title="Add Manufacture"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/manufactures", name: "Back To Manufactures" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Add New Manufacture</h3>
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
                      name="Submit"
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

export default Add;
