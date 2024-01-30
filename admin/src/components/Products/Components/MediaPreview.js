export const MediaPreview = ({
  media,
  deleteMedia,
  id,
  showFeatured = false,
  makeFeatured = () => {},
  featuredMediaId,
}) => {
  return (
    <div className="col-2 px-2 px-md-3 col-md-2">
      <div className="meCard" style={{ position: "relative" }}>
        <a href="javascript:void(0);">
          {showFeatured && featuredMediaId === id && (
            <span className="CoverImgTag">Cover Image</span>
          )}
          {!media.isVideo ? (
            <img src={media.media} alt="" />
          ) : (
            <video controls muted>
              <source src={media.media} type="video/mp4" />
            </video>
          )}
        </a>
        <div
          class="dropdown dropdownActionBtn"
          style={{ position: "absolute", top: "0px", right: "0px", zIndex: 10 }}
        >
          <button
            class="btn btn-lg dropdown-toggle_"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="22px"
              viewBox="0 0 128 512"
              fill="#333"
            >
              <path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" />
            </svg>
          </button>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {showFeatured && featuredMediaId !== id && !media.isVideo && (
              <a
                class="dropdown-item"
                href="javascript:void(0);"
                onClick={() => makeFeatured(id)}
              >
                Make Cover Image
              </a>
            )}
            <a
              class="dropdown-item"
              href="javascript:void(0);"
              onClick={() => deleteMedia(id)}
            >
              Remove
            </a>
          </div>
        </div>
        {/* <button
            className="btn btn-bg-danger ml-2"
           
          >
            Remove
          </button> */}
      </div>
    </div>
  );
};
