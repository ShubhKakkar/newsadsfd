import React, { useEffect, useState } from "react";

import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
  geocodeByPlaceId,
} from "react-places-autocomplete";

const GooglePlace = ({ saveAddress, defaultAddress, index, setValue }) => {
  const [address, setAddress] = useState("");

  useEffect(() => {
    setAddress(defaultAddress);
  }, [defaultAddress]);

  const handleChange = (address) => {
    setAddress(address);
  };

  const handleSelect = async (address, placeId) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {
        saveAddress(address, latLng, index);
        setAddress(address);
      });
    const [place] = await geocodeByPlaceId(placeId);
    const { long_name: postalCode = "" } =
      place.address_components.find((c) => c.types.includes("postal_code")) ||
      "";
    const { long_name: state = "" } =
      place.address_components.find((c) =>
        c.types.includes("administrative_area_level_1")
      ) || "";
    const { long_name: city = "" } =
      place.address_components.find((c) =>
        c.types.includes("administrative_area_level_2")
      ) || "";
    const { long_name: street = "" } =
      place.address_components.find((c) => c.types.includes("route")) || "";

    setValue(`zipcode_${index}`, postalCode ?? "");

    setValue(`state_${index}`, state ?? "");

    setValue(`city_${index}`, city ?? "");

    setValue(`street_${index}`, street ?? "");

    // .catch((error) => console.error("Error", error));
  };

  return (
    <PlacesAutocomplete
      value={address}
      onChange={handleChange}
      onSelect={handleSelect}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div>
          <input
            {...getInputProps({
              placeholder: "Search Places ...",
              className: "location-search-input form-control pr-5",
            })}
          />
          <div className="autocomplete-dropdown-container locationDropDown">
            {loading && <div className="mb2">Loading...</div>}
            {suggestions.map((suggestion) => {
              const className = suggestion.active
                ? "suggestion-item--active"
                : "suggestion-item";
              // inline style for demonstration purpose
              const style = suggestion.active
                ? { backgroundColor: "#fafafa", cursor: "pointer" }
                : { backgroundColor: "#ffffff", cursor: "pointer" };
              return (
                <div
                  {...getSuggestionItemProps(suggestion, {
                    className,
                    style,
                  })}
                  className="autocomDropdown pr-5"
                  key={suggestion.placeId}
                >
                  <span>{suggestion.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PlacesAutocomplete>
  );
};

export default GooglePlace;
