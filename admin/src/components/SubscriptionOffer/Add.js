import React, { useEffect,useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input,SelectInput, RenderInputFields, SubmitButton } from "../Form/Form";


const Add = (props) => {
  // const { id:id } = props.match.params;
  // let currDate = new Date();
  let currDate = new Date().toISOString().split("T")[0];

  const history = useHistory();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control: Control,
  } = useForm();

  const { response, request }                                         = useRequest();
  const { response: responseFetchUser, request: requestFetchSeeker }  = useRequest();
  const { response: responsePlans, request: requestPlans }            = useRequest();
  const [minDate, setMinDate]                                         = useState(currDate);
  const [minEndDate, setMinEndDate]                                   = useState(currDate);
  const [allPlans, setAllPlans]                                       = useState([]);



  useEffect(() => {
    document.title = "Add Subscription Offer - Noonmar";
    requestPlans("GET",`subscription-plan/all?page=1&isActive=${true}`)
  },[]);

  useEffect(() => {
    if (responseFetchUser) {
      const { name, monthlyPrice, yearlyPrice } = responseFetchUser.data;
      setValue("name", name);
      setValue("monthlyPrice", monthlyPrice);
      setValue("yearlyPrice", yearlyPrice);
    }
  }, [responseFetchUser]);

  useEffect(() => {
    if(responsePlans){
      if(responsePlans.status && responsePlans.data){
        setAllPlans(responsePlans.data);
      }
    }
  },[responsePlans])

  useEffect(() => {
    if (response) {
      toast.success("Subscription plan has been updated successfully.");
      history.push("/subscription-offers");
    }
  }, [response]);

  const onSubmit = (data) => {
    const {
        tenure,
        discountPrice,
        startDate,
        endDate,
        planId
    } = data;

    
    request("POST", "subscription-offer", {
    tenure,
    discountPrice,
    startDate,
    endDate,
    planId,
    });
  };

  const handleDateChange = (e,field) => {
    if(field == 'startDate'){
      const endDate = getValues('endDate');
      if(new Date(endDate).getTime() < new Date(e.target.value).getTime()){
        setValue('endDate',e.target.value)
      }
      setMinEndDate(e.target.value)
    }
  }

  const InputFields = [
    [
      {
        Component: SelectInput,
        label: "Subscription Plan",
        name: "planId",
        registerFields: {
          required: true
        },
        children: (
          allPlans && allPlans.length>0 && (
          <>
           <option value="">{"Select plan"}</option>
            {allPlans.map(obj => (
              <option key={obj._id} value={obj._id}> {obj.name}</option>
            ))}
          </>
          )
        ),
      },
        {
            Component: SelectInput,
            label: "Tenure",
            name: "tenure",
            registerFields: {
              required: true
            },
            children: (
              <>
                <option value="">{"Select an option"}</option>
                <option value="Monthly"> Monthly</option>
                <option value="Yearly"> Yearly</option>
              </>
            ),
            }, {
                Component: Input,
                label: "Discount Price",
                name: "discountPrice",
                registerFields: {
                  required: true,
                  pattern:/^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
                },
                registerFieldsFeedback: {
                    pattern: "Discount price can only contain numbers.",
                },
            },  
            {
                Component: Input,
                label: "Start Date",
                name: "startDate",
                type:"date",
                min:minDate,
                registerFields: {
                  required: true,
                },
                isDate:true,
                control:Control,
                handleDateChange
            },{
                Component: Input,
                label: "End Date",
                name: "endDate",
                type:"date",
                min:minEndDate,
                registerFields: {
                  required: true,
                },
                isDate:true,
                control:Control,
                handleDateChange
            }
     
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Subscription Offer  "
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/subscription-offers" /*backPageNum: page */ },
            name: "Back To Subscription Offers",
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
                    Add Subscription Offer
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

export default Add;
