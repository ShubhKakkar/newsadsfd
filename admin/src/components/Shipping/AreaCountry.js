import React from "react";

const AreaCountry = ({ area, countries, register, watch, setValue }) => {
  const selectAllHandler = (value, countryId) => {
    const cities = countries.find(
      (country) => country.value === countryId
    ).cities;

    cities.forEach((city) => {
      setValue(
        `area_${area.id}_country_${countryId}_city_${city.value}`,
        value
      );
    });
  };

  const citySelectHandler = (value, countryId, index) => {
    if (value) {
      const cities = countries.find(
        (country) => country.value === countryId
      ).cities;

      let allValues = watch(
        cities.map(
          (city) => `area_${area.id}_country_${countryId}_city_${city.value}`
        )
      );

      allValues[index] = true;

      const allTrue = allValues.every((d) => d);
      if (allTrue) {
        setValue(`area_${area.id}_selectAll_${countryId}`, true);
      }
    } else {
      setValue(`area_${area.id}_selectAll_${countryId}`, false);
    }
  };

  return (
    <div className="card card-custom gutter-b">
      {countries.map((country) => {
        return (
          <div
            key={country.value}
            className="row mb-7"
            style={{ flexDirection: "column" }}
          >
            <div className="col-12">
              <div className="row ">
                <div className="col-0">
                  <h3>{country.label}</h3>
                </div>
                <div className="col-10">
                  <label className="mr-2">Select All</label>
                  <input
                    type="checkBox"
                    {...register(`area_${area.id}_selectAll_${country.value}`)}
                    onChange={(e) =>
                      selectAllHandler(e.target.checked, country.value)
                    }
                  />
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                {country.cities.map((city, idx) => {
                  return (
                    <div key={city.value}>
                      <label className="mr-2">{city.label}</label>
                      <input
                        type="checkBox"
                        {...register(
                          `area_${area.id}_country_${country.value}_city_${city.value}`
                        )}
                        onChange={(e) => {
                          citySelectHandler(
                            e.target.checked,
                            country.value,
                            idx
                          );
                        }}
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
  );
};

export default AreaCountry;
