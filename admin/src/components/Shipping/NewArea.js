import React, { Fragment, useEffect, useState } from "react";
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

const Add = (props) => {
  const { id: shippingId } = props.match.params;

  const [areas, setAreas] = useState([
    {
      id: 0,
      // countryId: null,
      addedId: null,
      allArea: [{ id: 1, countryId: null, addedId: null }],
      // selectedCountryIds: [],
    },
  ]);

  const [nextId, setNextId] = useState(1);
  const [newNextId, setNewNextId] = useState(2);

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState({});

  // const [linkedObj, setLinkedObj] = useState({});
  const [deletedIds, setDeletedIds] = useState([]);

  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm();

  const { response, request } = useRequest();
  const { response: responseGet, request: requestGet } = useRequest();
  const { response: responseSubmit, request: requestSubmit } = useRequest();

  useEffect(() => {
    request("GET", "shipping-company/area/add-data");
  }, []);

  useEffect(() => {
    if (response) {
      // requestGet("GET", `shipping-company/area/${shippingId}`);
      const citiesObj = {};

      setCountries(
        response.countries.map((c) => {
          citiesObj[c.value] = c.cities;

          return {
            label: c.label,
            value: c.value,
          };
        })
      );

      setCities(citiesObj);
    }
  }, [response]);

  useEffect(() => {
    if (responseGet) {
      const addedAreas = responseGet.areas;

      if (addedAreas.length > 0) {
        const newCities = { ...cities };

        const newData = addedAreas.map((area, idx) => {
          setValue(`area${area._id}`, area.name);

          const data = area.areas.map((item, index) => {
            setValue(`country=${area._id}=${index}`, item.countryData);
            setValue(`cities=${area._id}=${index}`, item.citiesData);
            setNewNextId(index + 1);

            return {
              id: index,
              countryId: item.countryData.value,
            };
          });

          return {
            id: area._id,
            allArea: data,
            addedId: area._id,
          };
        });

        setAreas(newData);

        setCities(newCities);

        setNextId(addedAreas.length);
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
    const newAreas = [];
    const oldAreas = [];

    for (let i = 0; i < areas.length; i++) {
      const area = areas[i];
      const id = areas[i].id;
      const cities = [];
      const name = data[`area${id}`];

      for (let j = 0; j < area.allArea.length; j++) {
        const subAreaId = area.allArea[j].id;

        if (data[`cities=${id}=${subAreaId}`] != undefined) {
          cities.push({
            cities: data[`cities=${id}=${subAreaId}`].map((item) => item.value),
            country: data[`country=${id}=${subAreaId}`].value,
          });
        }
      }

      if (area.addedId) {
        oldAreas.push({
          id: area.addedId,
          name,
          areas: cities,
        });
      } else {
        newAreas.push({
          name,
          areas: cities,
          shippingId,
        });
      }
    }
    requestSubmit("PUT", "shipping-company/area", {
      newAreas,
      deletedAreas: deletedIds,
      oldAreas,
    });
  };

  const addAreaHandler = () => {
    setAreas((prev) => [
      ...prev,
      {
        id: nextId,
        // countryId: null,
        addedId: null,
        allArea: [{ id: 1, countryId: null, addedId: null }],
        // selectedCountryIds: [],
      },
    ]);
    setNextId((prev) => prev + 1);
  };

  const deleteAreaHandler = (id, countryId) => {
    if (countryId) {
      const selectedCities = watch(`cities${id}`);
      if (selectedCities) {
        //add to cities obj
        let newCitiesArr = cities[countryId];
        newCitiesArr = newCitiesArr.concat(selectedCities);

        const newCities = { ...cities };
        newCities[countryId] = newCitiesArr;
        setCities(newCities);
      }
    }

    const oldArea = areas.find((area) => area.id === id);

    if (oldArea.addedId) {
      setDeletedIds((prev) => [...prev, oldArea.addedId]);
    }

    const newAreas = [...areas].filter((area) => area.id !== id);
    setAreas(newAreas);
  };

  const deleteNewAreaHandler = (areaId, id, countryId) => {
    // if (countryId) {
    //   const selectedCities = watch(`cities${id}`);
    //   if (selectedCities) {
    //     //add to cities obj
    //     let newCitiesArr = cities[countryId];
    //     newCitiesArr = newCitiesArr.concat(selectedCities);

    //     const newCities = { ...cities };
    //     newCities[countryId] = newCitiesArr;
    //     setCities(newCities);
    //   }
    // }

    const newAreas = [...areas].map((area, index) => {
      if (area.id == areaId) {
        area.allArea = area?.allArea.filter((item) => item.id !== id);
      }
      return area;
    });
    setAreas(newAreas);
  };

  const addAreaHanlder = (id, countryId) => {
    const filterData = areas.map((item) => {
      if (item.id == id) {
        item.allArea.push({
          id: newNextId,
          countryId: null,
          addedId: null,
        });
      }
      return item;
    });
    setNewNextId((prev) => prev + 1);
    setAreas(filterData);
  };

  const selectCountryHandler = (id, rowId, event) => {
    setAreas((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          // let previousId;

          // if (linkedObj[id]) {
          //   previousId = linkedObj[id];
          // }

          // const newLinkedObj = linkedObj;
          // newLinkedObj[id] = event.value;
          // setLinkedObj(newLinkedObj);

          // const selectedCities = watch(`cities${id}`);

          // if (selectedCities && previousId) {
          //   //add to cities obj
          //   let newCitiesArr = cities[previousId];
          //   newCitiesArr = newCitiesArr.concat(selectedCities);

          //   const newCities = { ...cities };
          //   newCities[previousId] = newCitiesArr;
          //   setCities(newCities);
          // }

          // if (p.selectedCountryIds.includes(event.value)) {
          //   setValue(`country=${id}=${rowId}`, null);
          //   return p;
          // }

          setValue(`cities=${id}=${rowId}`, null);

          return {
            ...p,
            allArea: p.allArea.map((item) => {
              if (item.id === rowId) {
                // if(item.countryId){

                // }
                item.countryId = event.value;
              }
              return item;
            }),
            // selectedCountryIds: [...p.selectedCountryIds, event.value],
            // countryId: event.value,
          };
        }
        return p;
      })
    );
  };

  const selectCityHandler = (countryId, changedData) => {
    let newCitiesArr = cities[countryId];
    if (changedData.action === "select-option") {
      //changedData.option {} = remove from cities obj

      newCitiesArr = newCitiesArr.filter(
        (c) => c.value !== changedData.option.value
      );
    } else if (changedData.action === "remove-value") {
      //changedData.removedValue {} = add to cities obj
      newCitiesArr.push(changedData.removedValue);
    } else if (changedData.action === "clear") {
      //changedData.removedValues []  = add to cities obj
      newCitiesArr = newCitiesArr.concat(changedData.removedValues);
    }

    const newCities = { ...cities };
    newCities[countryId] = newCitiesArr;
    setCities(newCities);
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Areas"
        links={[
          { to: "/", name: "Dashboard" },
          { to: `/shipping-companies`, name: "Back To Shipping Companies" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Areas</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <button
                      class="btn btn-primary mr-2 mb-2 fixedButtonAdd2 zindex-1"
                      type="button"
                      onClick={addAreaHandler}
                    >
                      Add Area <i class="fas fa-plus p-0"></i>
                    </button>

                    {areas.map((area) => (
                      <Fragment key={area.id}>
                        <div className="row mt-3">
                          <div className="col-xl-3">
                            <MutliInput
                              type="text"
                              label="Area Name"
                              name={`area${area.id}`}
                              errors={errors}
                              placeholder="Area Name"
                              register={register}
                              registerFields={{
                                required: true,
                              }}
                            />
                          </div>

                          {area?.allArea?.map((item, index) => {
                            return (
                              <>
                                <div key={item.id} className="col-12 mt-4">
                                  <div className="row align-items-center">
                                    <div className="col-xl-4">
                                      <MultiReactSelectInput
                                        label="Country"
                                        name={`country=${area.id}=${item.id}`}
                                        errors={errors}
                                        registerFields={{ required: true }}
                                        options={countries}
                                        control={control}
                                        // colClass="col-xl-4"
                                        colClass="w-100"
                                        handleChange={(e, changedData) => {
                                          selectCountryHandler(
                                            area.id,
                                            item.id,
                                            e
                                          );
                                        }}
                                      />
                                    </div>

                                    {item.countryId && (
                                      <div className="col-xl-9 mt-4">
                                        <MultiReactSelectInput
                                          label="Cities"
                                          name={`cities=${area.id}=${item.id}`}
                                          errors={errors}
                                          registerFields={{ required: false }}
                                          options={cities[item.countryId]}
                                          control={control}
                                          colClass="w-100"
                                          handleChange={(e, changedData) => {
                                            // selectCityHandler(
                                            //   area.countryId,
                                            //   changedData
                                            // );
                                          }}
                                          isMultiple={true}
                                          required={false}
                                        />
                                      </div>
                                    )}
                                    {area?.allArea?.length > 1 && (
                                      <ButtonComp
                                        classes="btn btn-bg-danger ml-2"
                                        onClick={() =>
                                          deleteNewAreaHandler(
                                            area.id,
                                            item.id,
                                            item.countryId
                                          )
                                        }
                                      >
                                        <i class="fas fa-trash-alt text-white"></i>
                                      </ButtonComp>
                                    )}
                                  </div>
                                </div>
                              </>
                            );
                          })}

                          <ButtonComp
                            classes="btn btn-bg-primary ml-2 mt-2"
                            onClick={() =>
                              addAreaHanlder(area.id, area.countryId)
                            }
                          >
                            Add Country
                          </ButtonComp>

                          {areas.length > 1 && (
                            <ButtonComp
                              classes="btn btn-bg-danger ml-2 mt-2"
                              onClick={() =>
                                deleteAreaHandler(area.id, area.countryId)
                              }
                            >
                              {/* <i class="fas fa-trash-alt text-white"></i> */}
                              Delete Area
                            </ButtonComp>
                          )}
                        </div>
                        <hr />
                      </Fragment>
                    ))}

                    <div className="row"></div>

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

export default Add;
