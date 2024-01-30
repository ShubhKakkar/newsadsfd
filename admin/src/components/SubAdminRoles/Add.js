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
} from "../Form/Form";

import { PERMISSION, getParent } from "../../util/permission";

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
  const [keyFdata, setKeydata] = useState("");
  const [Arryname, setName] = useState([]);
  const [data, setData] = useState("");
  const [permissionDataArray, setpermissionDataArray] = useState([]);

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Admin Role - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Role has been added successfully.");
      history.push("/admin-roles");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { role } = data;

    let dataToSend = {
      role,
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

    request("POST", "admin-role", dataToSend);
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Role",
        type: "text",
        name: "role",
        registerFields: {
          required: true,
        },
      },
    ],
  ];

  const selectAllHandler = (bool, key) => {
    let filteredPermission = PERMISSION.find((a) => a.key === key);
    filteredPermission.children.forEach((a) => {
      setValue(a.key, bool);
    });
  };

  let changes = watch();

  useEffect(() => {
    PERMISSION.forEach((val) => {
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
        title="Add Admin Role"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/admin-roles", name: "Back To Admin Roles" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <h3 className="mb-10 font-weight-bold text-dark">
            General Information
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card card-custom gutter-b">
              <div className="card-body">
                <div className="row">
                  <div className="col-xl-1"></div>
                  <div className="col-xl-10">
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
            <h3 className="mb-10 font-weight-bold text-dark">Permissions</h3>
            <div className="card card-custom gutter-b">
              <div className="card-body">
                {PERMISSION.map((perm, ind) => {
                  return (
                    <div
                      key={ind}
                      className="row mb-7"
                      style={{ flexDirection: "column" }}
                    >
                      <div className="col-12">
                        <div className="row ">
                          <div className="col-0">
                            <h3>{perm.name}</h3>
                          </div>
                          <div className="col-10">
                            <label className="mr-2">Select All</label>
                            <input
                              type="checkBox"
                              id={`sa_${perm.key}`}
                              onClick={(e) =>
                                selectAllHandler(e.target.checked, perm.key)
                              }
                            />
                          </div>
                        </div>
                      </div>{" "}
                      <div className="mt-3">
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "20px",
                          }}
                        >
                          {perm.children.map((val, i) => {
                            return (
                              <div key={i}>
                                <label className="mr-2">{val.name}</label>
                                <input
                                  type="checkBox"
                                  name={val.key}
                                  {...register(val.key)}
                                />
                              </div>
                            );
                          })}
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
