const Loader = ({ text }) => {
  return (
    <div style={{ zIndex: 999999999 }} className="loader-wrapper">
      <div className="loader">
        <img src="/assets/img/logo.png" alt="" />
      </div>
      {text && <div>{text}</div>}
    </div>
  );
};

export default Loader;
