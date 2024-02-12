import React, { useEffect, useRef, useState } from "react";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import ClassicEditor from "../../ckeditor5/build/ckeditor";
import { CKEditor } from "ckeditor4-react";
import { Controller } from "react-hook-form";
import { API } from "../../constant/api";
import Select from "react-select";
import { Link } from "react-router-dom";
import AsyncSelect from "react-select/async";
import CreatableSelect from "react-select/creatable";
import { TagsInput } from "react-tag-input-component";
import { FixedSizeList as List } from "react-window";
import { useLocation, useHistory } from "react-router-dom";

let currDate = new Date();
currDate = currDate.toISOString().split("T")[0];

export const Input = ({
  colClass,
  label,
  type,
  tooltip,
  name,
  min,
  errors,
  register,
  registerFields,
  inputData,
  otherRegisterFields,
  registerFieldsFeedback,
  children,
  isDate,
  control,
  handleDateChange,
  isMedia,
  handleMedia = () => {},
  accept,
  image,
  video,
  handleRemoveMedia,
  max,
}) => {
  let [k, v] = name.split(".");
  let isKey = v ? (errors[k] ? errors[k][v] : errors[name]) : errors[name];

  return (
    <div className={`${colClass ? colClass : "col-xl-6"}`}>
      <div className="form-group">
        <label>
          {label}{" "}
          {registerFields.required ? (
            <span className="text-danger">*</span>
          ) : (
            ""
          )}
          {tooltip?.show ? (
            <i
              className="fa fa-question-circle fa-1x cursor"
              title={tooltip?.title}
            />
          ) : (
            ""
          )}
        </label>

        {isMedia ? (
          <>
            <Controller
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <input
                  type={type}
                  {...register(
                    name,
                    video
                      ? {
                          required: false,
                        }
                      : registerFields
                  )}
                  onChange={(e) => handleMedia(e)}
                  name={name}
                  accept={accept}
                  placeholder={label}
                  className={`form-control form-control-solid form-control-lg  ${
                    isKey && "is-invalid"
                  }`}
                  {...inputData}
                />
              )}
            />
          </>
        ) : isDate ? (
          <Controller
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <input
                type={type}
                {...register(name, registerFields)}
                onChange={(e) => handleDateChange(e, name)}
                name={name}
                min={min}
                max={max}
                placeholder={label}
                className={`form-control form-control-solid form-control-lg ${
                  isKey && "is-invalid"
                }`}
                {...inputData}
              />
            )}
          />
        ) : (
          <input
            type={type}
            className={`form-control form-control-solid form-control-lg ${
              isKey && "is-invalid"
            }`}
            name={name}
            min={min}
            placeholder={label}
            {...register(name, registerFields)}
            style={{ width: type === "checkbox" ? "20px" : "" }}
            {...inputData}
          />
        )}
        {registerFields?.required && isKey?.type === "required" && (
          <div className="invalid-feedback">
            The {label.toLowerCase()} field is required.
          </div>
        )}
        {registerFields?.minLength && isKey?.type === "minLength" && (
          <div className="invalid-feedback">
            The {label.toLowerCase()} field is invalid.
          </div>
        )}
        {registerFields?.maxLength && isKey?.type === "maxLength" && (
          <div className="invalid-feedback">
            The {label.toLowerCase()} field is invalid.
          </div>
        )}
        {registerFields?.min >= 0 && isKey?.type === "min" && (
          <div className="invalid-feedback">
            The {label.toLowerCase()} field is invalid.
          </div>
        )}
        {registerFields?.max <= 5 && isKey?.type === "max" && (
          <div className="invalid-feedback">
            The {label.toLowerCase()} field is invalid.
          </div>
        )}

        {registerFields?.pattern && isKey?.type === "pattern" && (
          <div className="invalid-feedback">
            {registerFieldsFeedback?.pattern}
          </div>
        )}

        {otherRegisterFields?.feedback && isKey?.type === "manual" && (
          <div className="invalid-feedback">{otherRegisterFields.feedback}</div>
        )}
        {image && (
          <>
            {" "}
            <br />
            <div className="d-flex">
              <img
                alt=""
                className="imageMedia"
                src={`${API.PORT}/${image}`}
                data-fancybox
              />
              {handleRemoveMedia && (
                <Link to="#" onClick={handleRemoveMedia} className="mx-3">
                  Remove
                </Link>
              )}
            </div>
          </>
        )}
        {video && (
          <>
            <div className="d-flex">
              <video className="videoMedia" controls>
                <source src={`${API.PORT}/${video}`} type="video/mp4" />
              </video>
              {handleRemoveMedia && (
                <Link to="#" onClick={handleRemoveMedia} className="mx-3">
                  Remove
                </Link>
              )}
            </div>
          </>
        )}
      </div>
      {children}
    </div>
  );
};

export const CKEditorInput = ({
  colClass,
  label,
  name,
  errors,
  registerFields,
  getValues,
  setValue,
  trigger,
  inputData,
  otherRegisterFields,
  clearErrors,
  isEdit,
}) => {
  return (
    <div className={`${colClass ? colClass : "col-xl-6"}`}>
      <div className="form-group">
        <label>
          {label}{" "}
          {registerFields?.required ? (
            <span className="text-danger">*</span>
          ) : (
            ""
          )}
        </label>
        <div className={`${errors[name] && "is-invalid"}`}>
          {/* <CKEditor
            editor={ClassicEditor}
            data={getValues(name)}
            onChange={(event, editor) => {
              const data = editor.getData();
              setValue(name, data);
              trigger(name);
              clearErrors(name);
            }}
            {...inputData}
          /> */}
          {isEdit && getValues(name) && (
            <CKEditor
              initData={getValues(name)}
              config={{
                extraAllowedContent:
                  "p(*)[*]{*};div(*)[*]{*};li(*)[*]{*};ul(*)[*]{*};i(*)[*]{*}",
                allowedContent: true,
                protectedSource: [/<i[^>]*><\/i>/g],
                // removeEmpty: { i: false },
              }}
              onChange={({ editor }) => {
                const data = editor.getData();
                if (data) {
                  setValue(name, data);
                  trigger(name);
                  clearErrors(name);
                }
              }}
              {...inputData}
            />
          )}
          {!isEdit && (
            <CKEditor
              initData={getValues(name)}
              config={{
                extraAllowedContent:
                  "p(*)[*]{*};div(*)[*]{*};li(*)[*]{*};ul(*)[*]{*};i(*)[*]{*}",
                allowedContent: true,
                protectedSource: [/<i[^>]*><\/i>/g],
                // removeEmpty: { i: false },
              }}
              onChange={({ editor }) => {
                const data = editor.getData();
                setValue(name, data);
                trigger(name);
                clearErrors(name);
              }}
              {...inputData}
            />
          )}
        </div>

        {registerFields?.required && errors[name]?.type === "required" && (
          <div className="invalid-feedback">
            The {label.toLowerCase()} field is required.
          </div>
        )}
        {otherRegisterFields?.manual && errors[name]?.type === "manual" && (
          <div className="invalid-feedback">{otherRegisterFields.feedback}</div>
        )}
      </div>
    </div>
  );
};

export const SelectInput = ({
  colClass,
  label,
  name,
  errors,
  register,
  registerFields,
  children,
  onChange,
  moreData,
  inputData,
  isEdit,
  defaultValue,
}) => {
  return (
    <div className={`${colClass ? colClass : "col-xl-6"}`}>
      <div className="form-group">
        <label>
          {label}{" "}
          {registerFields.required ? (
            <span className="text-danger">*</span>
          ) : (
            ""
          )}
        </label>

        {isEdit ? (
          <select
            defaultValue={defaultValue}
            value={defaultValue}
            name={name}
            className={`form-control form-control-solid form-control-lg ${
              errors[name] && "is-invalid"
            }`}
            {...register(name, registerFields)}
            onChange={(e) => onChange && onChange(e.target.value)}
            {...inputData}
          >
            {children}
          </select>
        ) : (
          <select
            name={name}
            className={`form-control form-control-solid form-control-lg  ${
              errors[name] && "is-invalid"
            }`}
            {...register(name, registerFields)}
            onChange={(e) => onChange && onChange(e.target.value)}
            // {...inputData}
          >
            {children}
          </select>
        )}

        {registerFields.required && errors[name]?.type === "required" && (
          <div className="invalid-feedback">
            The {label.toLowerCase()} field is required.
          </div>
        )}
      </div>
      {moreData}
    </div>
  );
};

export const Textarea = ({
  colClass,
  label,
  name,
  errors,
  register,
  registerFields,
  inputData,
}) => {
  let [k, v] = name.split(".");
  let isKey = v ? (errors[k] ? errors[k][v] : errors[name]) : errors[name];

  const refRegister = register(name, registerFields);

  return (
    <div className={`${colClass ? colClass : "col-xl-6"}`}>
      <div className="form-group">
        <label>
          {label}{" "}
          {registerFields.required ? (
            <span className="text-danger">*</span>
          ) : (
            ""
          )}
        </label>
        <textarea
          className={`form-control form-control-solid form-control-lg ${
            isKey && "is-invalid"
          }`}
          name={name}
          cols="30"
          rows="5"
          placeholder={`Enter ${label}`}
          // ref={inputData?.ref ?? null}
          // {...register(name, registerFields)}
          {...refRegister}
          ref={(e) => {
            refRegister.ref(e);
            // dobMonthInput.current = e;
            if (inputData?.ref) {
              inputData.ref.current = e;
            }
          }}
          // {...inputData}
        ></textarea>
        {registerFields?.required && isKey?.type === "required" && (
          <div className="invalid-feedback">
            The {label.toLowerCase()} field is required.
          </div>
        )}
      </div>
    </div>
  );
};

export const SearchInput = ({
  label,
  name,
  register,
  required,
  errors,
  isDate,
  clearErrors,
  otherRegisterFields,
  extras = {},
  isSelectInput,
  children,
}) => {
  const dateRef = useRef();

  const openDatePicker = () => {
    dateRef.current.children[0].showPicker();
  };

  return (
    <div className="col-lg-3 mb-lg-0 mb-6 mt-2">
      <label>{label}</label>

      {!isDate ? (
        !isSelectInput ? (
          <input
            type="text"
            placeholder={label}
            className={`form-control ${errors[name] && "is-invalid"}`}
            {...register(name, { required })}
            {...extras}
          />
        ) : (
          <select
            name={name}
            className={`form-control ${errors[name] && "is-invalid"}`}
            {...register(name, { required })}
            {...extras}
          >
            {children}
          </select>
        )
      ) : (
        <div ref={dateRef} onClick={openDatePicker}>
          <input
            type="date"
            placeholder={label}
            max={currDate}
            className={`form-control ${errors[name] && "is-invalid"}`}
            {...register(name, { required })}
            onChange={() => clearErrors && clearErrors(errors[name])}
            {...extras}
          />
        </div>
      )}

      {required && errors[name]?.type === "required" && (
        <div className="invalid-feedback">
          The {label.toLowerCase()} field is required.
        </div>
      )}
      {otherRegisterFields?.manual && errors[name]?.type === "manual" && (
        <div className="invalid-feedback">{otherRegisterFields.feedback}</div>
      )}
    </div>
  );
};

export const RenderInputFields = ({ InputFields, errors, register }, ref) => {
  return (
    <>
      {InputFields.map((inputMain, index) => {
        return (
          <div key={index} className="row">
            {inputMain.map((InputSub, index) => {
              return (
                <InputSub.Component
                  key={index}
                  {...InputSub}
                  errors={errors}
                  register={register}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
};

export const SubmitButton = ({ handleSubmit, onSubmit, name, pxClass }) => {
  return (
    <>
      <button
        onClick={handleSubmit(onSubmit)}
        style={{ display: "none" }}
      ></button>
      <div
        className={`d-flex justify-content-between border-top mt-5 pt-10 ${pxClass}`}
      >
        {/* px-10 */}
        <div className="mr-2">
          <button
            onClick={handleSubmit(onSubmit)}
            type="button"
            className="btn btn-success font-weight-bold text-uppercase px-9 py-4"
          >
            {name}
          </button>
        </div>
      </div>
    </>
  );
};

// export const ChangeStatusButton = () => {
//   return (
//     <>
//       <button
//         onClick={handleSubmit(onSubmit)}
//         style={{ display: "none" }}
//       ></button>
//       <div
//         className={`d-flex justify-content-between border-top mt-5 pt-10 ${pxClass}`}
//       >
//         {/* px-10 */}
//         <div className="mr-2">
//           <button
//             onClick={handleSubmit(onSubmit)}
//             type="button"
//             className="btn btn-success font-weight-bold text-uppercase px-9 py-4"
//           >
//             {name}
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

export const SearchSubmitButton = ({
  handleSubmit,
  onSearchHandler,
  onResetHandler,
}) => {
  return (
    <>
      <button
        onClick={handleSubmit(onSearchHandler)}
        style={{ display: "none" }}
      ></button>
      <div className="row mt-8">
        <div className="col-lg-12">
          <button
            className="btn btn-primary btn-primary--icon"
            id="kt_search"
            onClick={handleSubmit(onSearchHandler)}
          >
            <span>
              <span>Search</span>
              <i className="la la-search ml-1 pr-0"></i>
            </span>
          </button>
          &nbsp;&nbsp;
          <button
            className="btn btn-secondary btn-secondary--icon"
            id="kt_reset"
            data-toggle="collapse"
            data-target="#collapseOne6"
            onClick={onResetHandler}
          >
            <span>
              <i className="la la-close"></i>
              <span>Clear Search</span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export const OtherInput = ({
  label,
  type,
  name,
  errors,
  register,
  registerFields,
  otherRegisterFields,
  patternError,
}) => {
  return (
    <div className="form-group">
      <input
        className={`form-control ${
          errors[name] && "is-invalid"
        } form-control-solid h-auto py-7 px-6 border-0 rounded-lg font-size-h6`}
        type={type}
        name={name}
        autoComplete="off"
        placeholder={`Enter ${label}`}
        {...register(name, registerFields)}
      />
      {registerFields?.required && errors[name]?.type === "required" && (
        <div className="invalid-feedback">
          The {label.toLowerCase()} field is required.
        </div>
      )}
      {registerFields?.pattern && errors[name]?.type === "pattern" && (
        <div className="invalid-feedback">{patternError}</div>
      )}
      {otherRegisterFields?.manual && errors[name]?.type === "manual" && (
        <div className="invalid-feedback">{otherRegisterFields.feedback}</div>
      )}
    </div>
  );
};

export const ReactSelectInput = ({
  colClass,
  label,
  name,
  errors,
  register,
  registerFields,
  selectedOption,
  handleChange = () => {},
  options,
  isMultiple,
  isClearable = false,
  isDisabled = false,
}) => {
  const refRegister = register(name, registerFields);

  return (
    <div className={`${colClass ? colClass : "col-xl-6"}`}>
      <div className="form-group">
        <label>
          {label}{" "}
          {registerFields.required ? (
            <span className="text-danger">*</span>
          ) : (
            ""
          )}
        </label>

        <Select
          name={name}
          {...refRegister}
          ref={(e) => {
            refRegister.ref(e);
          }}
          value={selectedOption}
          onChange={handleChange}
          options={options}
          isMulti={isMultiple ? true : false}
          className={`select-reactSelect form-control-solid ${
            errors[name] && "is-invalid"
          }`}
          isClearable={isClearable}
          isDisabled={isDisabled}
        />

        {registerFields.required && errors[name]?.type === "required" && (
          <div className="invalid-feedback">
            The {label.toLowerCase()} field is required.
          </div>
        )}
        {registerFields.required && errors[name]?.type === "custom" && (
          <div className="invalid-feedback">{errors[name].message}</div>
        )}
      </div>
    </div>
  );
};

export const ReactSelectInputTwo = ({
  colClass,
  label,
  name,
  errors,
  registerFields,
  handleChange = () => {},
  options,
  isMultiple = false,
  isClearable = false,
  isDisabled = false,
  control,
  inputData = {},
}) => {
  const handleChangeHandler = (event, changedData) => {
    handleChange(event, changedData);
  };

  return (
    <div className={`${colClass ? colClass : "col-xl-6"}`}>
      <div className="form-group">
        <label>
          {label}{" "}
          {registerFields.required ? (
            <span className="text-danger">*</span>
          ) : (
            ""
          )}
        </label>

        <Controller
          className={`select-reactSelect  form-control-solid ${colClass} ${
            errors[name] && "is-invalid"
          }`}
          control={control}
          name={name}
          rules={{ required: registerFields.required }}
          render={({ field: { onChange, value, ref } }) => {
            return (
              <Select
                onChange={(val, changedData) => {
                  onChange(val);
                  handleChangeHandler(val, changedData);
                }}
                options={options}
                isMulti={isMultiple}
                value={value}
                className={`select-reactSelect form-control-solid ${colClass} ${
                  errors[name] && "is-invalid"
                }`}
                {...inputData}
                isDisabled={isDisabled}
                // components={{
                //   MenuList,
                // }}
                isClearable={isClearable}
              />
            );
          }}
        />

        {registerFields.required && errors[name]?.type === "required" && (
          <div className="invalid-feedback">
            The {label.toLowerCase()} field is required.
          </div>
        )}
        {registerFields.required && errors[name]?.type === "custom" && (
          <div className="invalid-feedback">{errors[name].message}</div>
        )}
      </div>
    </div>
  );
};

export const AsyncReactSelectInput = ({
  colClass,
  label,
  name,
  errors,
  register,
  registerFields,
  selectedOption,
  handleChange,
  promiseOptions,
  control,
  isMultiple,
  defaultOptions,
}) => {
  return (
    <div className={`${colClass ? colClass : "col-xl-6"}`}>
      <div className="form-group">
        <label>
          {label}{" "}
          {registerFields.required ? (
            <span className="text-danger">*</span>
          ) : (
            ""
          )}
        </label>

        {/* <AsyncSelect
          name={name}
          {...refRegister}
          ref={(e) => {
            refRegister.ref(e);
          }}
          value={selectedOption}
          onChange={handleChange}
          cacheOptions
          defaultOptions={defaultOptions}
          loadOptions={promiseOptions}
          isMulti={isMultiple ? true : false}
          className={`select-reactSelect form-control-solid ${
            errors[name] && "is-invalid"
          }`}
        /> */}

        <Controller
          name={name}
          control={control}
          rules={{ required: registerFields.required }}
          render={({ field }) => (
            <AsyncSelect
              {...field}
              cacheOptions
              defaultOptions={defaultOptions}
              loadOptions={promiseOptions}
              isMulti={isMultiple ? true : false}
              className={`select-reactSelect form-control-solid ${
                errors[name] && "is-invalid"
              }`}
              value={selectedOption}
              onChange={handleChange}
              // onInputChange={handleChange}
              // styles={customStyles}
            />
          )}
        />
        {registerFields.required && errors[name]?.type === "required" && (
          <div className="invalid-feedback">
            The {label.toLowerCase()} field is required.
          </div>
        )}
        {registerFields.required && errors[name]?.type === "custom" && (
          <div className="invalid-feedback">{errors[name].message}</div>
        )}
      </div>
    </div>
  );
};

export const SubTab = ({ name, index, image, tabName, onClick = () => {} }) => {
  return (
    <li className={`nav-item ${index > 0 ? "mr-3" : ""}`}>
      <a
        className={`nav-link ${index === 0 ? "active" : ""}`}
        data-toggle="tab"
        href={`#kt_apps_contacts_view_tab_${tabName}`}
        onClick={() => onClick(index)}
      >
        <>
          {false && image && (
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
  // getValues,
  // setValue,
  // trigger,
  required,
  // titleName,
  // descName,
  // clearErrors,
  // isEdit,
  // labels,
  InputFields,
  code,
  tabName,
  control,
}) => {
  return (
    <div
      className={`tab-pane ${index === 0 ? "active" : ""}`}
      id={`kt_apps_contacts_view_tab_${tabName}`}
      role="tabpanel"
    >
      <RenderMultiLangInputFields
        InputFields={InputFields}
        errors={errors}
        register={register}
        required={required}
        code={code}
        control={control}
      />

      {/* <div className="row"></div> */}
    </div>
  );
};

export const RenderMultiLangInputFields = ({
  InputFields,
  errors,
  register,
  required,
  code,
  control,

  // setValue,
  // clearErrors,
  // getValues,
}) => {
  return (
    <>
      {InputFields.map((inputMain, index) => {
        return (
          <div key={index} className="row">
            {inputMain.map((InputSub, idx) => {
              const registerFields = InputSub.registerFields || {};
              return (
                <InputSub.Component
                  key={idx}
                  {...InputSub}
                  errors={errors}
                  register={register}
                  registerFields={{
                    ...registerFields,
                    required:
                      typeof InputSub.isRequired === "boolean"
                        ? InputSub.isRequired
                        : required,
                  }}
                  name={InputSub.name + "-" + code}
                  code={code}
                  control={control}

                  // setValue={setValue}
                  // clearErrors={clearErrors}
                  // getValues={getValues}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
};

export const MutliInput = ({
  type,
  label,
  name,
  errors,
  placeholder,
  register,
  registerFields = {},
  inputData,
  registerFieldsFeedback = {},
  colClass,
  onChange,
}) => {
  let [k, v] = name.split(".");
  let isKey = v ? (errors[k] ? errors[k][v] : errors[name]) : errors[name];

  if (onChange) {
    registerFields.onChange = onChange;
  }
  return (
    <>
      {/* <label>
        {label}{" "}
        {registerFields.required ? <span className="text-danger">*</span> : ""}
      </label> */}
      <input
        type={type}
        className={`form-control form-control-solid form-control-lg ${colClass} ${
          isKey && "is-invalid"
        }`}
        name={name}
        placeholder={`${placeholder} ${registerFields.required ? "*" : ""}`}
        // placeholder={placeholder}
        {...register(name, registerFields)}
        {...inputData}
      />
      {registerFields?.required && isKey?.type === "required" && (
        <div className="invalid-feedback">
          The {label.toLowerCase()} field is required.
        </div>
      )}
      {registerFields?.pattern && isKey?.type === "pattern" && (
        <div className="invalid-feedback">
          {registerFieldsFeedback?.pattern}
        </div>
      )}
      {errors[name]?.type && errors[name]?.type === "custom" && (
        <div className="invalid-feedback">{errors[name]?.message}</div>
      )}
    </>
  );
};

const MenuList = (props) => {
  const height = 35;

  const { options, children, maxHeight, getValue } = props;
  const [value] = getValue();
  const initialOffset = options.indexOf(value) * height;

  return (
    <List
      height={maxHeight}
      itemCount={children.length}
      itemSize={height}
      initialScrollOffset={initialOffset}
    >
      {({ index, style }) => <div style={style}>{children[index]}</div>}
    </List>
  );
};

export const MultiReactSelectInput = ({
  label,
  name,
  errors,
  register,
  registerFields,
  // selectedOption,
  handleChange = () => {},
  options,
  control,
  isMultiple = false,
  colClass,
  required = true,
  inputData = {},
  isDisabled = false,
}) => {
  // const refRegister = register(name, registerFields);
  // const [selectedOption, setSelectedOption] = useState([]);

  const handleChangeHandler = (event, changedData) => {
    handleChange(event, changedData);
    // setSelectedOption(event);
  };
  return (
    <>
      {/* {false && (
        <Select
          name={name}
          {...refRegister}
          ref={(e) => {
            refRegister.ref(e);
          }}
          value={selectedOption}
          onChange={handleChangeHandler}
          options={options}
          isMulti={isMultiple}
          className={`select-reactSelect  form-control-solid ${
            errors[name] && "is-invalid"
          }`}
        />
      )} */}

      <Controller
        className={`select-reactSelect  select-style  form-control-solid ${colClass} ${
          errors[name] && "is-invalid"
        }`}
        control={control}
        name={name}
        rules={{ required: required }}
        render={({ field: { onChange, value, ref } }) => {
          return (
            <Select
              onChange={(val, changedData) => {
                onChange(val);
                handleChangeHandler(val, changedData);
              }}
              options={options}
              isMulti={isMultiple}
              value={value}
              className={`select-reactSelect select-style  form-control-solid ${colClass} ${
                errors[name] && "is-invalid"
              }`}
              // isDisabled={true}
              {...inputData}
              isDisabled={isDisabled}
              // components={{
              //   MenuList,
              // }}
            />
          );
        }}
      />

      {registerFields.required && errors[name]?.type === "required" && (
        <div className="invalid-feedback">
          The {label.toLowerCase()} field is required.
        </div>
      )}
    </>
  );
};

export const ButtonComp = ({ children, onClick, classes, show = true }) => {
  return (
    <>
      {!show ? (
        <></>
      ) : (
        <button type="button" className={classes} onClick={onClick}>
          {children}
        </button>
      )}
    </>
  );
};

export const CreatableReactSelectInput = ({
  colClass,
  label,
  name,
  errors,
  registerFields,
  handleChange = () => {},
  control,
  isMultiple = false,
  options,
}) => {
  return (
    <div className={`${colClass ? colClass : "col-xl-6"}`}>
      <div className="form-group">
        <label>
          {label}{" "}
          {registerFields.required ? (
            <span className="text-danger">*</span>
          ) : (
            ""
          )}
        </label>

        <Controller
          name={name}
          control={control}
          rules={{ required: registerFields.required }}
          render={({ field: { onChange, value, ref } }) => (
            <CreatableSelect
              onChange={(val) => {
                onChange(val);
                handleChange(val);
              }}
              cacheOptions
              options={options}
              isMulti={isMultiple ? true : false}
              className={`select-reactSelect form-control-solid ${
                errors[name] && "is-invalid"
              }`}
              value={value}
            />
          )}
        />

        {registerFields.required && errors[name]?.type === "required" && (
          <div className="invalid-feedback">
            The {label.toLowerCase()} field is required.
          </div>
        )}
      </div>
    </div>
  );
};

export const InputTag = ({
  name,
  control,
  registerFields,
  label,
  placeholder,
}) => {
  return (
    <>
      <label className="col-2">{label}</label>
      <Controller
        name={name}
        control={control}
        rules={{ required: registerFields.required }}
        render={({ field: { onChange, value } }) => (
          <TagsInput
            value={value}
            separators={[" "]}
            onChange={(e) => {
              // const set = new Set(
              //   e.filter((d) => d.trim().length > 0).map((e) => e.trim())
              // );
              // onChange([...set]);
              onChange(e);
            }}
            style={{ width: "500px" }}
            className="col-12"
            placeHolder={placeholder}
            isEditOnRemove
            beforeAddValidate={(tag, tags) => {
              tag = tag.trim();
              if (tag.length > 0) {
                if (tags.includes(tag)) {
                  return false;
                }
                return true;
              }
              return false;
            }}
          />
        )}
      />
    </>
  );
};

export const MultiAsyncReactSelectInput = ({
  colClass,
  label,
  name,
  errors,
  register,
  registerFields,
  // selectedOption,
  handleChange = () => {},
  options,
  control,
  isMultiple = false,
  required = true,
  inputData = {},
  isDisabled = false,
  promiseOptions,
}) => {
  const handleChangeHandler = (event, changedData) => {
    handleChange(event, changedData);
  };
  return (
    <>
      <Controller
        className={`select-reactSelect  select-style  form-control-solid ${colClass} ${
          errors[name] && "is-invalid"
        }`}
        control={control}
        name={name}
        rules={{ required: required }}
        render={({ field: { onChange, value, ref } }) => {
          return (
            <AsyncSelect
              onChange={(val, changedData) => {
                onChange(val);
                handleChangeHandler(val, changedData);
              }}
              cacheOptions
              defaultOptions={options}
              loadOptions={promiseOptions}
              isMulti={isMultiple}
              value={value}
              className={`select-reactSelect select-style  form-control-solid ${colClass} ${
                errors[name] && "is-invalid"
              }`}
              {...inputData}
              isDisabled={isDisabled}
              // components={{
              //   MenuList,
              // }}
            />
          );
        }}
      />

      {registerFields.required && errors[name]?.type === "required" && (
        <div className="invalid-feedback">
          The {label.toLowerCase()} field is required.
        </div>
      )}
    </>
  );
};
