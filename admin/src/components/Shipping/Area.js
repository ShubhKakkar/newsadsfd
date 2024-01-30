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
import AreaCountry from "./AreaCountry";

const Add = (props) => {
  const { id: shippingId } = props.match.params;

  const [areas, setAreas] = useState([
    { id: 0, countryId: null, addedId: null },
  ]);
  const [nextId, setNextId] = useState(1);

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState({});

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
      setCountries(response.countries);

      requestGet("GET", `shipping-company/area/${shippingId}`);

      const citiesObj = {};

      response.countries.forEach((c) => {
        citiesObj[c.value] = c.cities;
      });

      setCities(citiesObj);
    }
  }, [response]);

  useEffect(() => {
    if (responseGet) {
      const addedAreas = responseGet.areas;

      if (addedAreas.length > 0) {
        setAreas(
          addedAreas.map((area, idx) => {
            setValue(`area${idx}`, area.name);

            area.areas.forEach((a) => {
              let selectedCitiesCount = a.cities.length;

              a.cities.forEach((city) => {
                setValue(`area_${idx}_country_${a.country}_city_${city}`, true);
              });

              if (selectedCitiesCount === cities[a.country].length) {
                setValue(`area_${idx}_selectAll_${a.country}`, true);
              }
            });

            return {
              id: idx,
              addedId: area._id,
            };
          })
        );

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
      const id = area.id;

      const name = data[`area${id}`];

      const selectedCountries = [];

      countries.forEach((country) => {
        const selectedCities = [];

        country.cities.forEach((city) => {
          if (data[`area_${id}_country_${country.value}_city_${city.value}`]) {
            selectedCities.push(city.value);
          }
        });

        if (selectedCities.length > 0) {
          selectedCountries.push({
            country: country.value,
            cities: selectedCities,
          });
        }
      });

      if (selectedCountries.length === 0) {
        toast.error(`Please select alteast one city in ${name} area`);
        return;
      }

      if (area.addedId) {
        oldAreas.push({
          id: area.addedId,
          name,
          areas: selectedCountries,
        });
      } else {
        newAreas.push({
          name,
          shippingId,
          areas: selectedCountries,
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

    const oldArea = areas.find((area) => area.id === id);

    if (oldArea.addedId) {
      setDeletedIds((prev) => [...prev, oldArea.addedId]);
    }

    const newAreas = [...areas].filter((area) => area.id !== id);
    setAreas(newAreas);
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
                      // row
                      <div key={area.id} className="mt-3">
                        {/* className="col-xl-3" */}
                        <div className="row">
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

                        {/* accordion-solid accordion-toggle-plus */}
                        <div
                          class="accordion  mt-2"
                          id={`accordionExample_${area.id}`}
                        >
                          <div class="card">
                            <div
                              class="card-header"
                              id={`headingOne_${area.id}`}
                            >
                              <h2 class="mb-0">
                                <button
                                  class="btn btn-link btn-block text-left"
                                  type="button"
                                  data-toggle="collapse"
                                  data-target={`#collapseOne_${area.id}`}
                                  aria-expanded="true"
                                  aria-controls={`collapseOne_${area.id}`}
                                >
                                  Select Country and Cities
                                </button>
                              </h2>
                            </div>

                            <div
                              id={`collapseOne_${area.id}`}
                              class="collapse"
                              aria-labelledby={`headingOne_${area.id}`}
                              data-parent={`#accordionExample_${area.id}`}
                            >
                              <div class="card-body">
                                <AreaCountry
                                  area={area}
                                  countries={countries}
                                  register={register}
                                  watch={watch}
                                  setValue={setValue}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
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
