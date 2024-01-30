import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, RenderInputFields,SelectInput, SubmitButton } from "../Form/Form";

const Edit = (props) => {
  const { id: recordId }    = props.match.params;
  const history             = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    control
  } = useForm();

  const { response: responseReel, request: requestReel }        =  useRequest();
  const { response, request }                                   = useRequest();
  const { response:responseVendors, request:requestVendors }    = useRequest();


  const [file, setFile]                                         = useState();
  const [allVendors, setAllVendors]                             = useState([]);
  const [selectedVendor, setSelectedVendor]                     = useState();
  useEffect(() => {
    if (recordId) {
        requestReel("GET", `reel/${recordId}`);
        requestVendors("GET",`vendor/all?page=1&isActive=${true}`);
        document.title = "Edit Storefront Reel - Noonmar";
    }
  }, [recordId]);

  useEffect(() => {
    if (responseReel) {
      const { video,user } = responseReel.data;
      setFile(video);
      setValue("video", video);
      setValue("vendor", user?._id);
      setSelectedVendor(user?._id)
    }
  }, [responseReel]);

  useEffect(() => {
    if(responseVendors){
      if(responseVendors.status && responseVendors.users){
        setAllVendors(responseVendors.users);
      }
    }
  },[responseVendors])

  useEffect(() => {
    if (response) {
      toast.success("Reel has been updated successfully.");
      history.push("/storefront-reels");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { video,vendor } = data;

    let fd = new FormData();
    fd.append('id',recordId);
    fd.append('vendor',vendor);
    if(video){
      fd.append("video",video[0]);
    }
    request("PUT", "reel", fd);
  };

  const handleVideo = (event) => {
    event.preventDefault();
    setError('video','')
  }

  const handleRemoveMedia = () => {
    setValue('video','');
    setFile('');
  }

  const handleChangeVendor = (vendorId) => {
    setSelectedVendor(vendorId);
  }

  const InputFields = [
    [
      {
        Component: SelectInput,
        label: "Vendor",
        name: "vendor",
        registerFields: {
          required: true
        },
        children: (
          allVendors && allVendors.length>0 && (
          <>
           <option value="">{"Select vendor"}</option>
            {allVendors.map(obj => (
              <option key={obj._id} value={obj._id}> {obj.businessName}</option>
            ))}
          </>
          )
        ),
        onChange:handleChangeVendor,
        isEdit:true,
        defaultValue:selectedVendor
     },{ 
        Component: Input,
        label: "Video",
        type: "file",
        name: "video",
        registerFields: {
          required: true
        },
        handleMedia:handleVideo,
        isMedia:true,
        accept:".mp4",
        video:file,
        control,
        handleRemoveMedia:handleRemoveMedia
      }
    ] 
  ];

 

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Storefront Reel"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/storefront-reels" /*backPageNum: page */ },
            name: "Back To Storefront Reels",
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
                    Edit Reel
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
