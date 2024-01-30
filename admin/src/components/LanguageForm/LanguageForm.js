import React from "react";
import { Input, Textarea } from "../Form/Form";
import { API } from "../../constant/api";

export const SubTab = ({ name, index, image, onClick }) => {
  return (
    <li
      onClick={() => onClick && onClick(index)}
      className={`nav-item ${index > 0 ? "mr-3" : ""}`}
    >
      <a
        className={`nav-link ${index === 0 ? "active" : ""}`}
        data-toggle="tab"
        href={`#kt_apps_contacts_view_tab_${index}`}
      >
        <>
          {image && false && (
            <span className="symbol symbol-20 mr-3">
              <img src={`${API.PORT}/${image}`} alt="" />
            </span>
          )}
          <span className="nav-text">{name}</span>
        </>
      </a>
    </li>
  );
};

export const SubInput = ({
  index,
  errors,
  register,
  getValues,
  setValue,
  trigger,
  required,
  titleName,
  titleLabel,
  featuresName,
  featuresLabel,
  clearErrors,
  isEdit,
  colClass
}) => {
  return (
    <div
      className={`tab-pane ${index === 0 ? "active" : ""}`}
      id={`kt_apps_contacts_view_tab_${index}`}
      role="tabpanel"
    >
      {titleName && (
        <div className="row">
          <Input
            label={titleLabel}
            type="text"
            name={titleName}
            errors={errors}
            register={register}
            registerFields={{ required }}
            colClass={colClass}
          />
        </div>
      )}
      {featuresName && (
        <div className="row">
          <Textarea
            label={featuresLabel}
            register={register}
            errors={errors}
            name={featuresName}
            registerFields={{ required }}
            colClass="col-xl-12"
          />
        </div>
      )}

      <div className="row"></div>
    </div>
  );
};

export const SubInputReadable = ({ index, label, lang }) => {
  return (
    <div
      className={`tab-pane ${index === 0 ? "active" : ""}`}
      id={`kt_apps_contacts_view_tab_${index}`}
      role="tabpanel"
    >
      {lang.name && (
        <div className="form-group row my-2">
          <label className="col-4 col-form-label">
            {label ? label : "Name"}{" "}
          </label>
          <div className="col-8">
            <span className="form-control-plaintext font-weight-bolder">
              {lang?.name}
            </span>
          </div>
        </div>
      )}

      {lang.title && (
        <div className="form-group row my-2">
          <label className="col-4 col-form-label">Title </label>
          <div className="col-8">
            <span className="form-control-plaintext font-weight-bolder">
              {lang?.title}
            </span>
          </div>
        </div>
      )}

      {lang.features && (
        <div className="form-group row my-2">
          <label className="col-4 col-form-label">Features </label>
          <div className="col-8">
            <span className="form-control-plaintext font-weight-bolder">
              {lang?.features}
            </span>
          </div>
        </div>
      )}
      <div className="row"></div>
    </div>
  );
};
