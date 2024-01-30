export const Sidebar = () => {
  return (
    <div className="col-3">
      <ul className="nav flex-column nav-pills">
        <li className="nav-item">
          <a
            className="tablnk nav-link active"
            data-tabid={1}
            data-toggle="tab"
            href="#kt_tab_pane_1"
          >
            Shipping Information
          </a>{" "}
        </li>
        <li className="nav-item">
          <a
            className="tablnk nav-link "
            data-tabid={2}
            data-toggle="tab"
            href="#kt_tab_pane_2"
          >
            Translated Info
          </a>
        </li>
      </ul>
    </div>
  );
};
