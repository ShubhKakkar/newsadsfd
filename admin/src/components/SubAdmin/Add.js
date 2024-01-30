import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  RenderInputFields,
  SubmitButton,
  SelectInput,
  Textarea,
} from "../Form/Form";
import { getParent, PERMISSION as modules } from "../../util/permission";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm();

  const { response, request } = useRequest();
  const { response: getRolesRes, request: getRolesReq } = useRequest();
  //   const [keyFdata, setKeydata] = useState(true);
  const [roleData, setRoleData] = useState([]);
  //   const [Rdata, setData] = useState("");
  const history = useHistory();

  const permissions = [...modules];

  useEffect(() => {
    document.title = "Add Sub-Admin - Noonmar";
    getRolesReq("GET", "master/admin-role");
  }, []);

  useEffect(() => {
    if (getRolesRes) {
      setRoleData(getRolesRes?.roles);
    }
  }, [getRolesRes]);

  useEffect(() => {
    if (response) {
      toast.success("Sub Admin has been added successfully.");
      history.push("/sub-admins");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { name, email, role, contact, otherDetails } = data;
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setError("email", {
        type: "manual",
      });
      return;
    }

    let dataToSend = {
      email,
      name,
      role,
      contact,
      otherDetails,
      permissions: [],
    };

    for (let p in data) {
      const isChild = p.includes("_");

      if (p !== "name" && p !== "email" && data[p] === true && isChild) {
        dataToSend.permissions.push(p);
        let parent = getParent(p);
        if (parent && !dataToSend.permissions.includes(parent)) {
          dataToSend.permissions.push(parent);
        }
      }
    }

    dataToSend.permissions = [...new Set(dataToSend.permissions)];

    request("POST", "sub-admin/create", dataToSend);
  };

  const chekRecommended = (id) => {
    let selectedRole = roleData.find((val) => val._id === id);

    let allowedModulesObj = {};
    selectedRole.permissions.forEach((val) => {
      allowedModulesObj[val] = true;
    });

    permissions.forEach((val) => {
      val.children.forEach((subVal) => {
        if (allowedModulesObj[subVal.key]) {
          setValue(subVal.key, true);
        } else {
          setValue(subVal.key, false);
        }
      });
    });
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
        //   pattern: "Name can only contain letters.",
        // },
      },
      {
        Component: Input,
        label: "Email",
        type: "email",
        name: "email",
        registerFields: {
          required: true,
          pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        },
        registerFieldsFeedback: {
          pattern: "The email field must be a valid email address.",
        },
      },
      {
        Component: Input,
        label: "Phone Number",
        type: "number",
        name: "contact",
        registerFields: {
          // required: true,
        },
      },
      {
        Component: SelectInput,
        label: "Role",
        name: "role",
        registerFields: {
          required: true,
        },
        children: (
          <>
            <option value="">Select</option>
            {roleData.map((val, i) => (
              <option key={i} value={val._id}>
                {val.role}
              </option>
            ))}
          </>
        ),
        onChange: (id) => {
          chekRecommended(id);
        },
      },
      {
        Component: Textarea,
        label: "Other Details",
        type: "text",
        name: "otherDetails",
        registerFields: {
          required: false,
        },
      },
    ],
  ];

  const selectAllHandler = (bool, key) => {
    let filteredPermission = permissions.find((a) => a.key === key);
    filteredPermission.children.forEach((a) => {
      setValue(a.key, bool);
    });
  };

  let changes = watch();

  useEffect(() => {
    permissions.forEach((val) => {
      let isAllSelected = true;
      let allSelectElem = document.getElementById(`sa_${val.key}`);
      if (!allSelectElem) return;
      allSelectElem.checked = true;
      val.children.forEach((subVal) => {
        if (changes[subVal.key] === false) {
          isAllSelected = false;
        }
      });
      if (!isAllSelected) {
        allSelectElem.checked = false;
      }
    });
  }, [changes]);

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Sub Admin"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/sub-admins", name: "Back To Sub Admin" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card card-custom gutter-b">
              <div class="card-header">
                <h3 class="card-title">General Information</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-xl-12">
                    <RenderInputFields
                      InputFields={InputFields}
                      errors={errors}
                      register={register}
                    />
                    <div className="row"></div>
                  </div>
                  <div className="col-xl-1"></div>
                </div>
              </div>
            </div>
            <div className="card card-custom gutter-b">
              <div class="card-header">
                <h3 class="card-title">Permissions</h3>
              </div>
              <div className="card-body">
                {permissions.map((perm, ind) => {
                  return (
                    <div
                      key={ind}
                      className="row_ mb-7"
                      style={{ flexDirection: "column" }}
                    >
                      <div className="col-12">
                        <div className="row align-items-center">
                          <div className="col-0 ">
                            <h4 class=" text-dark font-weight-bold me-2">
                              {perm.name}
                            </h4>
                          </div>
                          <div className=" checkbox-inline mb-05">
                            <label className="checkbox checkbox-square mr-2">
                              <input
                                type="checkBox"
                                id={`sa_${perm.key}`}
                                onClick={(e) =>
                                  selectAllHandler(e.target.checked, perm.key)
                                }
                              />
                              <span></span>
                              Select All
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="form-group">
                          <div className="checkbox-inline flex-wrap gap2">
                            {perm.children.map((val, i) => {
                              return (
                                <label
                                  key={i}
                                  className="checkbox checkbox-square"
                                >
                                  <input
                                    type="checkBox"
                                    name={val.key}
                                    {...register(val.key)}
                                  />
                                  <span></span>
                                  {val.name}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <SubmitButton
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmit}
                  name="Submit"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;
