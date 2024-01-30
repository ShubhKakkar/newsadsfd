import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Textarea, RenderInputFields, SubmitButton } from "../Form/Form";

const AddComment = (props) => {
  const { id: recordId }    = props.match.params;
  const history             = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const { response: responseReel, request: requestReel }        =  useRequest();
  const { response, request }                                   = useRequest();

  useEffect(() => {
    if (recordId) {
        requestReel("GET", `user-request/${recordId}`);
        document.title = "Add Comment - Noonmar";
    }
  }, [recordId]);

  useEffect(() => {
    if (responseReel) {
      const { comment } = responseReel.data;
      setValue("comment", comment);
    }
  }, [responseReel]);

  useEffect(() => {
    if (response) {
      toast.success("Comment has been added successfully.");
      history.push("/help-support");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { comment } = data;    
    request("PUT", "user-request", {comment,id:recordId});
  };


  const InputFields = [
    [
        {
            Component: Textarea,
            label: "Comment",
            type: "text",
            name: "comment",
            registerFields: {
                required: true,
            },
            colClass:'col-xl-12'
        }
    ] 
  ];

 

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Comment"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/help-support" /*backPageNum: page */ },
            name: "Back To Help & Support",
          },
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
                    Add New Comment
                  </h3>

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

export default AddComment;
