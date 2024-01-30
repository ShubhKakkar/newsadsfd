import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    // resetField,
    setValue,
    trigger,
    getValues,
  } = useForm();

  const [pageNames, setPageNames] = useState([]);

  const { response, request } = useRequest();
  const { response: responseFetchNames, request: requestFetchName } =
    useRequest();

  const history = useHistory();

  useEffect(() => {
    register("description", { required: true });
    requestFetchName("GET", "cms/remaining/name");
  }, []);

  useEffect(() => {
    if (responseFetchNames) {
      setPageNames(responseFetchNames.names || []);
    }
  }, [responseFetchNames]);

  useEffect(() => {
    if (response) {
      toast.success("CMS Page has been added successfully.");
      history.push("/cms");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { description, pageName, title } = data;
    request("POST", "cms", { title, description, name: pageName });
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add CMS Page"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/cms", name: "Back To CMS Page" },
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
                    Add New CMS Page
                  </h3>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                      <div className="col-xl-6">
                        <div className="form-group">
                          <label>
                            Page Name <span className="text-danger">*</span>
                          </label>
                          <select
                            name="packaging"
                            className={`form-control form-control-solid form-control-lg ${
                              errors.pageName && "is-invalid"
                            }`}
                            {...register("pageName", {
                              required: true,
                              minLength: 1,
                            })}
                          >
                            <option value="">
                              {pageNames.length == 0
                                ? "No Page Name left to use"
                                : "Select Page Name"}
                            </option>
                            {pageNames.length > 0 &&
                              pageNames.map((name, index) => (
                                <option key={index} value={name}>
                                  {name}
                                </option>
                              ))}
                            {/* <option value="input">Text</option> */}
                            {/* <option value="textarea">Text Area</option> */}
                          </select>
                          {errors.pageName?.type === "required" && (
                            <div className="invalid-feedback">
                              Page Name is required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-xl-6">
                        <div className="form-group">
                          <label>
                            Page Title <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control form-control-solid form-control-lg ${
                              errors.title && "is-invalid"
                            }`}
                            name="title"
                            placeholder="Enter Title"
                            {...register("title", {
                              required: true,
                            })}
                          />
                          {errors.title?.type === "required" && (
                            <div className="invalid-feedback">
                              Page Title is required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-xl-12">
                        <div className="form-group">
                          <label>
                            Description <span className="text-danger">*</span>
                          </label>

                          <div
                            className={`${errors.description && "is-invalid"}`}
                          >
                            <CKEditor
                              editor={ClassicEditor}
                              data={getValues("description")}
                              // onReady={(editor) => {
                              //   editor.editing.view.change((writer) => {
                              //     writer.setStyle(
                              //       "height",
                              //       "200px",
                              //       editor.editing.view.document.getRoot()
                              //     );
                              //   });
                              // }}
                              onChange={(event, editor) => {
                                const data = editor.getData();
                                setValue("description", data);
                                trigger("description");
                              }}
                            />
                          </div>

                          {errors.description?.type === "required" && (
                            <div className="invalid-feedback">
                              Description is required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row"></div>

                    <button
                      onClick={handleSubmit(onSubmit)}
                      style={{ display: "none" }}
                    ></button>

                    <div className="d-flex justify-content-between border-top mt-5 pt-10">
                      <div className="mr-2">
                        <button
                          onClick={handleSubmit(onSubmit)}
                          type="button"
                          className="btn btn-success font-weight-bold text-uppercase px-9 py-4"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
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
