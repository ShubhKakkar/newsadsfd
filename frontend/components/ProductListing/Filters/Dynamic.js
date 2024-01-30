export const Dynamic = ({ filters, register, name = "" }) => {
  return (
    <>
      {filters.map((filter) => (
        <div key={filter._id} className="accordion-item">
          <h2 className="accordion-header" id={`flush-heading${filter._id}`}>
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#flush-collapse${filter._id}`}
              aria-expanded="false"
              aria-controls={`flush-collapse${filter._id}`}
            >
              {filter.name}
            </button>
          </h2>
          <div
            id={`flush-collapse${filter._id}`}
            className="accordion-collapse collapse"
            aria-labelledby={`flush-heading${filter._id}`}
            data-bs-parent="#accordionFlushExample"
          >
            <div className="accordion-body">
              <div className="stock-checkBox">
                {filter.values.map((value) => (
                  <div key={value} className="form-check">
                    <div className="custom_checkbox position-relative check-type2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        defaultValue=""
                        id={value}
                        {...register(`dynamic${name}.${filter._id}_${value}`)}
                      />
                    </div>
                    <label className="form-check-label" htmlFor={value}>
                      {value}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
