import { RenderInputFields, Input, SelectInput } from "../../Form/Form";

export const PriceInputFields = [
  {
    Component: Input,
    label: "Selling Price",
    type: "text",
    name: "sellingPrice",
    registerFields: {
      required: true,
      pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
    },
    registerFieldsFeedback: {
      pattern: "Price can only contain numbers.",
    },
  },
  {
    Component: Input,
    label: "Discounted Price",
    type: "text",
    name: "discountedPrice",
    registerFields: {
      required: true,
      pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
    },
    registerFieldsFeedback: {
      pattern: "Discounted Price can only contain numbers.",
    },
  },
];

export const Price = ({
  errors,
  register,
  selectedCountries = [],
  isOptional = false,
  currencies = [],
}) => {
  return (
    <div
      className="tab-pane fad"
      id="kt_tab_pane_2"
      role="tabpanel"
      aria-labelledby="kt_tab_pane_2"
      style={{ minHeight: 490 }}
    >
      <div>
        <h3 className="mb-10 font-weight-bold text-dark">Prices</h3>
      </div>
      <RenderInputFields
        InputFields={[
          [
            {
              Component: Input,
              colClass: "col-xl-4 pr-0 childBorderNone",
              label: "Buying Price",
              type: "text",
              name: "buyingPrice",
              registerFields: {
                required: !isOptional,
                pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
              },
              registerFieldsFeedback: {
                pattern: "Price can only contain numbers.",
              },
            },
            {
              Component: SelectInput,
              colClass: "col-xl-2 pl-0 childBorderNone",
              // label: "Currency (Buying Price)",
              label: "Currency",
              name: "currency",
              registerFields: {
                required: !isOptional,
              },
              children: (
                <>
                  <option value="">Select</option>
                  {currencies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.sign}
                    </option>
                  ))}
                </>
              ),
            },
            {
              Component: Input,
              label: "Selling Price",
              type: "text",
              name: "sellingPrice",
              registerFields: {
                required: !isOptional,
                pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
              },
              registerFieldsFeedback: {
                pattern: "Price can only contain numbers.",
              },
            },
         
          ],
        ]}
        errors={errors}
        register={register}
      />
      {false && selectedCountries.length > 0 && (
        <div className="row">
          <div className="col-3">
            <ul className="nav flex-column nav-pills">
              {selectedCountries.map((country, idx) => (
                <li key={idx} className="nav-item">
                  <a
                    className={`tablnk nav-link ${idx === 0 ? "active" : null}`}
                    data-tabid={1}
                    data-toggle="tab"
                    href={`#kt_tab_pane_200${idx}`}
                  >
                    {country.label}
                  </a>{" "}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-9">
            <div
              className="tab-content mt-0"
              id="myTabContent"
              data-select2-id="myTabContent"
            >
              {selectedCountries.map((country, idx) => (
                <div
                  key={idx}
                  className={`tab-pane fade ${
                    idx === 0 ? "active show" : null
                  }`}
                  id={`kt_tab_pane_200${idx}`}
                  role="tabpanel"
                  aria-labelledby={`kt_tab_pane_200${idx}`}
                  style={{ minHeight: 490 }}
                >
                  <div>
                    <h3 className="mb-10 font-weight-bold text-dark">
                      {country.label}
                    </h3>
                  </div>
                  <RenderInputFields
                    InputFields={[
                      PriceInputFields.map((p) => ({
                        ...p,
                        name: `${p.name}_${country.value}`,
                      })),
                    ]}
                    errors={errors}
                    register={register}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
