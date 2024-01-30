import { MediaSelectPreview } from "./MediaSelectPreview";

export const VariantMedia = ({
  // subVariants,
  selectedMedia,
  unselectMediaHandler,
  idx,
  // sv,
}) => {
  return (
    // <div
    //   className="tab-pane fade"
    //   id="kt_tab_pane_11"
    //   role="tabpanel"
    //   aria-labelledby="kt_tab_pane_11"
    //   style={{ minHeight: 490 }}
    // >
    //   <div>
    //     <h3 className="mb-10 font-weight-bold text-dark">Variant Media</h3>
    //   </div>
    <div class="accordion mb-5" id="accordionExample1">
      {/* {subVariants.map((sv, idx) => {
          return ( */}
      <div key={idx} class="card">
        <div class="card-header" id={`headingSix-${idx}`}>
          <h2 class="mb-0">
            <button
              class="btn btn-link btn-block text-left"
              type="button"
              data-toggle="collapse"
              data-target={`#collapseSix-${idx}`}
              aria-expanded="true"
              aria-controls={`collapseSix-${idx}`}
            >
              {/* {sv.name} */}
              Media
            </button>
          </h2>
        </div>

        <div
          id={`collapseSix-${idx}`}
          class="collapse"
          aria-labelledby={`headingSix-${idx}`}
          data-parent="#accordionExample1"
        >
          <div class="card-body">
            <div className="instadata">
              <div className="continueBx_">
                <div className="form_input_area">
                  <div className="row">
                    {selectedMedia[idx]?.length === 0
                      ? "No Media Uploaded"
                      : selectedMedia[idx]?.map((media) => (
                          <MediaSelectPreview
                            media={media}
                            key={media.id}
                            id={media.id}
                            updateMedia={(id, type) =>
                              unselectMediaHandler(idx, id, type)
                            }
                          />
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* );
        })} */}
    </div>
    // </div>
  );
};
