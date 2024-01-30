import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
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

const EditSubadmin = () => {
  const { id } = useParams();
  const [permissionDataArray, setpermissionDataArray] = useState([]);
  const [Arryname, setName] = useState([]);
  const [data, setData] = useState("");
  const [keyFdata, setKeydata] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm();

  const { response, request } = useRequest();
  const { response: responseFetchRole, request: requestFetchRole } =
    useRequest();

  const history = useHistory();

  useEffect(() => {
    if (id) {
      requestFetchRole("GET", `admin-role/${id}`);
      document.title = "Edit Admin Role - Noonmar";
    }
  }, [id]);

  useEffect(() => {
    if (responseFetchRole) {
      const { role, permissions } = responseFetchRole.role;
      setValue("role", role);
      if (permissions && permissions.length > 0) {
        permissions.forEach((val) => {
          setValue(val, true);
        });
      }
    }
  }, [responseFetchRole]);

  useEffect(() => {
    if (response) {
      toast.success("Admin role has been updated successfully.");
      history.push("/admin-roles");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { role } = data;

    let dataToSend = {
      id,
      role,
      permissions: ["o", "o1"],
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


    request("PUT", "admin-role", dataToSend);
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
        title="Edit Admin Role"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/admin-roles", name: "Back To Admin Roles" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card card-custom gutter-b">
            <div class="card-header">
                <h3 class="card-title">General information</h3>
            </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-xl-12">
                    <RenderInputFields
                      InputFields={InputFields}
                      errors={errors}
                      register={register}
                    />
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
                {PERMISSION.map((perm, ind) => {
                  return (
                    <div
                      key={ind}
                      className="row mb-7"
                      style={{ flexDirection: "column" }}
                    >
                      <div className="col-12">
                        <div className="row align-items-center">
                          <div className="col-0">
                          <h4 class=" text-dark font-weight-bold me-2">{perm.name}</h4>
                          </div>
                          <div className="col-0 checkbox-inline mb-05">
                            <label className="checkbox checkbox-square mr-2">
                           
                            <input
                              type="checkBox"
                              id={`sa_${perm.key}`}
                              onClick={(e) =>
                                selectAllHandler(e.target.checked, perm.key)
                              }
                            /> <span></span>Select All
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="form-group">
                          <div className="checkbox-inline flex-wrap gap2">

                            {perm.children.map((val, i) => {
                              return (
                                  <label  key={i} className="checkbox checkbox-square">
                                  <input
                                    type="checkBox"
                                    name={val.key}
                                    {...register(val.key)}
                                  />
                                  <span></span>
                                  {val.name}</label>
                              );
                            })}

                          </div>
                        </div>
                      </div>
                      <div className="row"></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card card-custom gutter-b">
              <div className="card-body">
                <div className="row">
                  <div className="col-xl-12">
                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmit}
                      name="Submit"
                    />
                  </div>
                  <div className="col-xl-1"></div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSubadmin;
