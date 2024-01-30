import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  ButtonComp,
  MultiReactSelectInput,
  MutliInput,
  SubmitButton,
} from "../Form/Form";

const Price = (props) => {
  const { id: shippingId } = props.match.params;

  const [areas, setAreas] = useState([]);

  const [numOfAreas, setNumOfAreas] = useState([]); //{id, areaId}
  const [nextAreaId, setNextAreaId] = useState(0);

  const [weights, setWeights] = useState([]);
  const [nextWeightId, setNextWeightId] = useState(0);

  const [linkedObj, setLinkedObj] = useState({});
  const [areasObj, setAreasObj] = useState({});

  const [id, setId] = useState(null);

  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    setValue,
    watch,
    unregister,
  } = useForm();

  const { response, request } = useRequest();
  const { response: responseSubmit, request: requestSubmit } = useRequest();
  const { response: responseGet, request: requestGet } = useRequest();

  useEffect(() => {
    request("GET", `shipping-company/area/${shippingId}`);
  }, []);

  useEffect(() => {
    if (response) {
      requestGet("GET", `shipping-company/price/${shippingId}`);
      setAreas(
        response.areas.map((area) => ({ label: area.name, value: area._id }))
      );

      const areasObj = {};

      response.areas.forEach((area) => {
        areasObj[area._id] = area.name;
      });

      setAreasObj(areasObj);
    }
  }, [response]);

  useEffect(() => {
    if (responseGet) {
      const prices = responseGet.prices;

      if (prices) {
        setId(prices._id);

        setNumOfAreas(
          prices.areas.map((area, _idx) => ({
            id: _idx,
            areaId: area._id,
          }))
        );

        setNextAreaId(prices.areas.length);

        setWeights(prices.weights.map((_, idx) => idx));
        setNextWeightId(prices.weights.length);

        const linkedObj = {};
        const areaIds = [];

        prices.areas.forEach((area, idx) => {
          setValue(`area${idx}`, area.areaData);

          linkedObj[idx] = area.areaData.value;
          areaIds.push(area.areaData.value);

          area.weightsAndPrices.forEach((price, i) => {
            setValue(`price-${i}-${idx}`, price.price);
          });
        });

        prices.weights.forEach((weight, idx) => {
          setValue(`weight${idx}`, weight);
        });

        setLinkedObj(linkedObj);

        setAreas((prev) => prev.filter((p) => !areaIds.includes(p.value)));
      }
    }
  }, [responseGet]);

  useEffect(() => {
    if (responseSubmit) {
      toast.success(responseSubmit.message);
      history.push("/shipping-companies");
    }
  }, [responseSubmit]);

  const onSubmit = (data) => {
    const weightsArr = [];
    const areasArr = [];

    weights.forEach((weight) => {
      weightsArr.push(data[`weight${weight}`]);
    });

    if (weightsArr.length === 0) {
      toast.error("Please add atleast one weight");
      return;
    }

    for (let i = 0; i < numOfAreas.length; i++) {
      const area = numOfAreas[i];

      const weightsAndPrices = [];

      weights.forEach((weight) => {
        weightsAndPrices.push({
          weight: data[`weight${weight}`],
          price: data[`price-${weight}-${area.id}`],
        });
      });

      areasArr.push({ areaId: data[`area${area.id}`].value, weightsAndPrices });
    }

    requestSubmit("PUT", "shipping-company/price", {
      id,
      shippingId,
      weights: weightsArr,
      areas: areasArr,
    });
  };

  const addAreaHandler = () => {
    setNumOfAreas((prev) => [...prev, { id: nextAreaId, areaId: "" }]);
    setNextAreaId((prev) => prev + 1);

    if (weights.length === 0) {
      setWeights([nextWeightId]);
      setNextWeightId((prev) => prev + 1);
    }
  };

  const addWeightHandler = () => {
    setWeights((prev) => [...prev, nextWeightId]);
    setNextWeightId((prev) => prev + 1);

    if (numOfAreas.length === 0) {
      setNumOfAreas([{ id: nextAreaId, areaId: "" }]);
      setNextAreaId((prev) => prev + 1);
    }
  };

  const selectAreaHandler = (key, e) => {
    if (linkedObj[key]) {
      let newAreas = [...areas];
      const newLinkedObj = linkedObj;

      newAreas.push({
        label: areasObj[linkedObj[key]],
        value: linkedObj[key],
      });

      newAreas = newAreas.filter((area) => area.value !== e.value);

      newLinkedObj[key] = e.value;

      setAreas(newAreas);
      setLinkedObj(newLinkedObj);
    } else {
      const newLinkedObj = linkedObj;
      newLinkedObj[key] = e.value;

      setLinkedObj(newLinkedObj);
      setAreas((prev) => prev.filter((p) => p.value !== e.value));
    }
  };

  const deleteAreaHandler = (areaId) => {
    //add area to areas Arr
    //remove area from numOfAreas Arr
    //remove price according to weights
    //remove from linkedObj

    if (linkedObj[areaId]) {
      const newAreas = [...areas];
      newAreas.push({
        label: areasObj[linkedObj[areaId]],
        value: linkedObj[areaId],
      });

      setAreas(newAreas);

      const newLinkedObj = linkedObj;
      delete newLinkedObj[areaId];
      setLinkedObj(newLinkedObj);
    }

    setNumOfAreas((prev) => prev.filter((p) => p.id !== areaId));

    unregister(`area${areaId}`);

    weights.forEach((weight) => {
      unregister(`price-${weight}-${areaId}`);
    });
  };

  const deleteWeightHandler = (weightId) => {
    //remove weight from weights arr
    //remove price according to weights

    setWeights((prev) => prev.filter((p) => p !== weightId));

    unregister(`weight${weightId}`);

    numOfAreas.forEach((area) => {
      unregister(`price-${weightId}-${area.id}`);
    });
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Prices"
        links={[
          { to: "/", name: "Dashboard" },
          { to: `/shipping-companies`, name: "Back To Shipping Companies" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Prices</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                   
                    <div className="table-responsive">
                      <table className="table table-bordered row_padding">
                        <thead>
                          <tr>
                            <th scope="col">Weights</th>
                            {numOfAreas.map((area) => (
                              <th key={area.id} scope="col">
                                {/* {area.id} */}
                                <div className="row">
                                  <MultiReactSelectInput
                                    label="Area"
                                    name={`area${area.id}`}
                                    errors={errors}
                                    registerFields={{ required: true }}
                                    options={areas}
                                    control={control}
                                    // colClass="col-xl-4"
                                    colClass="w-75"
                                    handleChange={(e, changedData) => {
                                      selectAreaHandler(area.id, e);
                                    }}
                                  />
                                  {numOfAreas.length > 1 && (
                                    <ButtonComp
                                      classes="btn btn-bg-danger ml-2"
                                      onClick={() => deleteAreaHandler(area.id)}
                                    >
                                      <i class="fas fa-trash-alt text-white"></i>
                                    </ButtonComp>
                                  )}
                                </div>
                              </th>
                            ))}
                            <th scope="col">
                              {" "}
                              <button
                                className="btn btn-primary"
                                onClick={addAreaHandler}
                                type="button"
                              >
                                ADD Area
                              </button>{" "}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {weights.length === 0 ? (
                            <tr>
                              <td>
                                <button
                                  className="btn btn-primary"
                                  onClick={addWeightHandler}
                                  type="button"
                                >
                                  ADD Weight
                                </button>
                              </td>
                              <td></td>
                            </tr>
                          ) : (
                            <>
                              {weights.map((weight) => (
                                <tr key={weight}>
                                  <td>
                                    <div className="row">
                                      <MutliInput
                                        type="text"
                                        label="Weight"
                                        name={`weight${weight}`}
                                        errors={errors}
                                        placeholder="Weight"
                                        register={register}
                                        registerFields={{
                                          required: true,
                                        }}
                                      />
                                      {weights.length > 1 && (
                                        <ButtonComp
                                          classes="btn btn-bg-danger ml-2"
                                          onClick={() =>
                                            deleteWeightHandler(weight)
                                          }
                                        >
                                          <i class="fas fa-trash-alt text-white"></i>
                                        </ButtonComp>
                                      )}
                                    </div>
                                  </td>
                                  {numOfAreas.map((area) => (
                                    <td key={area.id}>
                                      <MutliInput
                                        type="text"
                                        label="Price"
                                        name={`price-${weight}-${area.id}`}
                                        errors={errors}
                                        placeholder="Price"
                                        register={register}
                                        registerFields={{
                                          required: true,
                                        }}
                                      />
                                    </td>
                                  ))}
                                  <td></td>
                                </tr>
                              ))}
                              <tr>
                                <td>
                                  <button
                                    className="btn btn-primary"
                                    onClick={addWeightHandler}
                                    type="button"
                                  >
                                    ADD Weight
                                  </button>
                                </td>
                                {numOfAreas.map((area) => (
                                  <td key={area.id}></td>
                                ))}
                                <td></td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

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
    </div>
  );
};

export default Price;
