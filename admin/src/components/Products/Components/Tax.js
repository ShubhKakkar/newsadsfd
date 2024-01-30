export const Tax = ({ taxesToShow, register }) => {
  return (
    <div
      className="tab-pane fade"
      id="kt_tab_pane_4"
      role="tabpanel"
      aria-labelledby="kt_tab_pane_4"
      style={{ minHeight: 490 }}
    >
      <div>
        <h3 className="mb-10 font-weight-bold text-dark">Taxes</h3>
      </div>
      <div class="accordion" id="accordionExample3">
        {taxesToShow.map((t) => (
          <div key={t._id} class="card">
            <div class="card-header" id={`headingTax-${t._id}`}>
              <h2 class="mb-0">
                <button
                  class="btn btn-link btn-block text-left"
                  type="button"
                  data-toggle="collapse"
                  data-target={`#collapseTax-${t._id}`}
                  aria-expanded="true"
                  aria-controls={`collapseTax-${t._id}`}
                >
                  {t.countryName}
                </button>
              </h2>
            </div>

            <div
              id={`collapseTax-${t._id}`}
              class="collapse"
              aria-labelledby={`headingTax-${t._id}`}
              data-parent="#accordionExample3"
            >
              <div class="card-body">
                <div className="form-group">
                  <div className="checkbox-inline flex-wrap gap2">
                    {t.taxes.map((tax) => (
                      <label key={tax.id} class="checkbox checkbox-square">
                        <input
                          type="checkbox"
                          id={tax.id}
                          {...register(`tax-${t._id}-${tax.id}`)}
                        />
                        <span></span>
                        {tax.name} ({tax.tax}%)
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
