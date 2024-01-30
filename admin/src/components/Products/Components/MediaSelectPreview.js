export const MediaSelectPreview = ({ media, updateMedia }) => {
  // const [isSelected, setIsSelected] = useState(media.isSelected);

  const setPostToArr = () => {
    if (media.isSelected) {
      // setIsSelected(false);
      updateMedia(media.id, "remove");
    } else {
      // setIsSelected(true);
      updateMedia(media.id, "add");
    }
  };

  return (
    <div onClick={setPostToArr} className="col-2 px-2 px-md-3 col-md-2">
      <div className="meCard">
        <a
          href="javascript:void(0);"
          className={`${media.isSelected ? "active" : ""}`}
        >
          {!media.isVideo ? (
            <img src={media.media} alt="" />
          ) : (
            <video controls muted>
              <source src={media.media} type="video/mp4" />
            </video>
          )}
        </a>
      </div>
    </div>
  );
};
