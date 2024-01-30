import React from "react";
import { Input, CKEditorInput } from "../Form/Form";
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
  descName,
  clearErrors,
  isEdit,
}) => {
  return (
    <div
      className={`tab-pane ${index === 0 ? "active" : ""}`}
      id={`kt_apps_contacts_view_tab_${index}`}
      role="tabpanel"
    >
      <div className="row">
        <Input
          label="Page Title"
          type="text"
          name={titleName}
          errors={errors}
          register={register}
          registerFields={{ required }}
        />
      </div>

      <div className="row">
        <CKEditorInput
          label="Description"
          name={descName}
          errors={errors}
          registerFields={{ required }}
          getValues={getValues}
          setValue={setValue}
          trigger={trigger}
          clearErrors={clearErrors}
          colClass="col-xl-12"
          isEdit={isEdit}
        />
      </div>

      <div className="row"></div>
    </div>
  );
};

export const SubInputReadable = ({ index, lang }) => {
  return (
    <div
      className={`tab-pane ${index === 0 ? "active" : ""}`}
      id={`kt_apps_contacts_view_tab_${index}`}
      role="tabpanel"
    >
      {lang.title && (
        <div className="form-group row my-2">
          <label className="col-4 col-form-label">Page Title:</label>
          <div className="col-8">
            <span className="form-control-plaintext font-weight-bolder">
              {lang?.title}
            </span>
          </div>
        </div>
      )}
      {lang.description && (
        <div className="form-group row my-2">
          <label className="col-4 col-form-label">Page Description:</label>
          <div className="col-8">
            <span
              dangerouslySetInnerHTML={{
                __html: lang?.description,
              }}
              className="form-control-plaintext font-weight-bolder"
            ></span>
          </div>
        </div>
      )}

      <div className="row"></div>
    </div>
  );
};
