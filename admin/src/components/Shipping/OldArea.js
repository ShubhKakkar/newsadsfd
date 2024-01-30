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

const Add = (props) => {
  const { id: shippingId } = props.match.params;

  const [areas, setAreas] = useState([
    { id: 0, countryId: null, addedId: null },
  ]);
  const [nextId, setNextId] = useState(1);

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState({});

  const [linkedObj, setLinkedObj] = useState({});
  const [deletedIds, setDeletedIds] = useState([]);

  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
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
        const linkedObj = {};

        const newCities = { ...cities };

        setAreas(
          addedAreas.map((area, idx) => {
            const countryId = area.countryData.value;
            linkedObj[idx] = countryId;

            setValue(`area${idx}`, area.name);
            setValue(`country${idx}`, area.countryData);
            setValue(`cities${idx}`, area.citiesData);

            let newCitiesArr = newCities[countryId];

            if (area.cities.length > 0) {
              newCitiesArr = newCitiesArr.filter(
                (c) => !area.cities.includes(c.value)
              );

              newCities[countryId] = newCitiesArr;
            }

            return {
              id: idx,
              countryId: countryId,
              addedId: area._id,
            };
          })
        );

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
    // const deletedAreas = [];
    const oldAreas = [];

    const countriesWithoutCitiesObj = {};

    for (let i = 0; i < areas.length; i++) {
      const area = areas[i];
      const id = area.id;

      const name = data[`area${id}`];
      const country = data[`country${id}`];
      const cities = data[`cities${id}`];

      if (cities.length === 0) {
        if (countriesWithoutCitiesObj[country.value]) {
          toast.error(
            `There can only be one area of a particular country without cities. Please remove all the areas where country is ${country.label} and no cities selected. `
          );
          return;
        } else {
          countriesWithoutCitiesObj[country.value] = 1;
        }
      }

      if (area.addedId) {
        oldAreas.push({
          id: area.addedId,
          name,
          country: country.value,
          cities: cities.map((city) => city.value),
        });
      } else {
        newAreas.push({
          name,
          country: country.value,
          cities: cities.map((city) => city.value),
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
      { id: nextId, countryId: null, addedId: null },
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

  const selectCountryHandler = (id, event) => {
    setAreas((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          if (p.countryId === event.value) {
            return p;
          }

          let previousId;

          if (linkedObj[id]) {
            previousId = linkedObj[id];
          }

          const newLinkedObj = linkedObj;
          newLinkedObj[id] = event.value;
          setLinkedObj(newLinkedObj);

          const selectedCities = watch(`cities${id}`);

          if (selectedCities && previousId) {
            //add to cities obj
            let newCitiesArr = cities[previousId];
            newCitiesArr = newCitiesArr.concat(selectedCities);

            const newCities = { ...cities };
            newCities[previousId] = newCitiesArr;
            setCities(newCities);
          }

          setValue(`cities${id}`, []);

          return {
            ...p,
            countryId: event.value,
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
                      //   style={{ bottom: "unset" }}
                      onClick={addAreaHandler}
                    >
                      Add Area <i class="fas fa-plus p-0"></i>
                    </button>
                    {areas.map((area) => (
                      <div key={area.id} className="row mt-3">
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
                        <div className="col-xl-3">
                          <MultiReactSelectInput
                            label="Country"
                            name={`country${area.id}`}
                            errors={errors}
                            registerFields={{ required: true }}
                            options={countries}
                            control={control}
                            // colClass="col-xl-4"
                            colClass="w-100"
                            handleChange={(e, changedData) => {
                              selectCountryHandler(area.id, e);
                            }}
                          />
                        </div>
                        {area.countryId && (
                          <div className="col-xl-4">
                            <MultiReactSelectInput
                              label="Cities"
                              name={`cities${area.id}`}
                              errors={errors}
                              registerFields={{ required: false }}
                              options={cities[area.countryId]}
                              control={control}
                              // colClass="col-xl-4"
                              colClass="w-100"
                              handleChange={(e, changedData) => {
                                selectCityHandler(area.countryId, changedData);
                              }}
                              isMultiple={true}
                              required={false}
                            />
                          </div>
                        )}

                        {areas.length > 1 && (
                          <ButtonComp
                            classes="btn btn-bg-danger ml-2"
                            onClick={() =>
                              deleteAreaHandler(area.id, area.countryId)
                            }
                          >
                            <i class="fas fa-trash-alt text-white"></i>
                          </ButtonComp>
                        )}
                      </div>
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
