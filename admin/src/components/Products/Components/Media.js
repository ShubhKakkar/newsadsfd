import { useDropzone } from "react-dropzone";
import { MediaPreview } from "./MediaPreview";

export const Media = ({
  mediaViewHandler,
  selectedMedia,
  unselectMediaHandler,
  makeFeaturedHandler,
  featuredMediaId,
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*,video/*",
    onDrop: (acceptedFiles) => {
      mediaViewHandler(acceptedFiles);
    },
  });

  return (
    <div
      className="tab-pane fade"
      id="kt_tab_pane_9"
      role="tabpanel"
      aria-labelledby="kt_tab_pane_9"
      style={{ minHeight: 490 }}
    >
      <div style={{ gap: "10px" }} className="d-flex">
        <h3 className="mb-10 font-weight-bold text-dark">Media </h3>{" "}
        <span>(Required resolution is 1:1.45 (Width:Height))</span>
      </div>
      <div className="modal-body- mb-3 mt-3">
        <section>
          <div
            {...getRootProps({
              className: "dropzone dropzoneHeight",
            })}
          >
            <input {...getInputProps()} />
            <p>
              Drag 'n' drop some media files here, or click to select media
              files
            </p>
          </div>
        </section>
      </div>

      <div className="instadata">
        <div className="row">
          {selectedMedia["main"].filter((media) => media.isSelected).length >
            0 &&
            selectedMedia["main"]
              .filter((media) => media.isSelected)
              .map((media) => (
                <MediaPreview
                  deleteMedia={(id) =>
                    unselectMediaHandler("main", id, "remove")
                  }
                  media={media}
                  key={media.id}
                  id={media.id}
                  showFeatured={true}
                  makeFeatured={makeFeaturedHandler}
                  featuredMediaId={featuredMediaId}
                ></MediaPreview>
              ))}
        </div>
      </div>
    </div>
  );
};
