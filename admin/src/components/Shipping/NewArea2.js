import React, { Fragment, useEffect, useState, memo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Select, { components } from "react-select";
import { FixedSizeList as List } from "react-window";
import DropdownTreeSelect from "react-dropdown-tree-select";
import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { ButtonComp, MutliInput, SubmitButton } from "../Form/Form";

const height = 35;

/*
const MenuList = (props) => {
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

const GroupOption = (props) => {
  const {
    Heading,
    getStyles,
    getClassNames,
    children,
    label,
    headingProps,
    cx,
    theme,
    selectProps,
  } = props;

  return (
    <div>
      <div style={{ display: "flex" }}>
        <Heading
          selectProps={selectProps}
          theme={theme}
          getStyles={getStyles}
          getClassNames={getClassNames}
          cx={cx}
          {...headingProps}
        >
          {label}
        </Heading>
      </div>
      <div className="pl-5">{children}</div>
    </div>
  );
};

const InputOption = ({
  getStyles,
  Icon,
  isDisabled,
  isFocused,
  isSelected,
  children,
  innerProps,
  ...rest
}) => {
  const [isActive, setIsActive] = useState(false);
  const onMouseDown = () => setIsActive(true);
  const onMouseUp = () => setIsActive(false);
  const onMouseLeave = () => setIsActive(false);

  // styles
  let bg = "transparent";
  if (isFocused) bg = "#eee";
  if (isActive) bg = "#B2D4FF";

  const style = {
    alignItems: "center",
    backgroundColor: bg,
    color: "inherit",
    display: "flex ",
  };

  // prop assignment
  const props = {
    ...innerProps,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    style,
  };

  return (
    <components.Option
      {...rest}
      isDisabled={isDisabled}
      isFocused={isFocused}
      isSelected={isSelected}
      getStyles={getStyles}
      innerProps={props}
    >
      <input type="checkbox" checked={isSelected} readOnly className="mr-1" />
      {children}
    </components.Option>
  );
};

const createGroup = (groupName, options, setValue, selectedOptions) => {
  const newOptions = options.map((op) => op.value);

  const isAllSelected =
    newOptions.filter((grpOpt) => !selectedOptions.includes(grpOpt)).length ===
    0;

  return {
    label: (() => {
      return (
        <div
          onClick={() => {
            if (isAllSelected) {
              setValue((prev) => prev.filter((v) => !newOptions.includes(v)));
            } else {
              setValue((prev) =>
                prev.concat(
                  newOptions.filter((grpOpt) => !prev.includes(grpOpt))
                )
              );
            }
          }}
        >
          <input
            type="checkbox"
            checked={isAllSelected}
            readOnly
            className="mr-1"
          />
          <span className="h6">{groupName}</span>
        </div>
      );
    })(),
    options: options,
  };
};

const CitySelect = ({
  alreadySelectedOptions = [],
  name,
  groupedOptions,
  errors,
  control,
  setValue,
  citiesObj,
}) => {
  const [selectedOptions, setSelectedOptions] = useState(
    alreadySelectedOptions
  );

  let options = groupedOptions.map((g) =>
    createGroup(g.label, g.options, setSelectedOptions, selectedOptions)
  );

  useEffect(() => {
    if (selectedOptions.length !== 0) {
      setValue(
        name,
        selectedOptions.map((value) => {
          const label = citiesObj[value];
          return {
            label,
            value,
          };
        })
      );
    } else {
      setValue(name, []);
    }
  }, [selectedOptions]);

  const filterOption = ({ label, value }, string) => {
    // default search
    label = label.toLocaleLowerCase();
    string = string.toLocaleLowerCase();
    if (label.includes(string) || value.includes(string)) return true;

    // check if a group as the filter string as label
    const groupOptions = groupedOptions.filter((group) =>
      group.label.toLocaleLowerCase().includes(string)
    );

    if (groupOptions) {
      for (const groupOption of groupOptions) {
        // Check if current option is in group
        const option = groupOption.options.find((opt) => opt.value === value);
        if (option) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <>
      <Controller
        className={`select-reactSelect  select-style  form-control-solid ${
          errors[name] && "is-invalid"
        }`}
        control={control}
        name={name}
        rules={{ required: true }}
        render={({ field: { onChange, value, ref } }) => {
          return (
            <Select
              isMulti
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              onChange={(options) => {
                if (Array.isArray(options)) {
                  setSelectedOptions(options.map((op) => op.value));
                  //   onChange(options);
                }
              }}
              options={options}
              components={{
                Option: InputOption,
                Group: GroupOption,
                MenuList,
              }}
              value={value}
              filterOption={filterOption}
              // menuIsOpen
            />
          );
        }}
      />

      {errors[name]?.type === "required" && (
        <div className="invalid-feedback">This field is required.</div>
      )}
    </>
  );
};
*/

const CitySelectTwo = memo(
  ({ groupedOptions, id, updateAreaSelection, citiesObj }) => {
    const [data, setData] = useState([]);
    // const [isSelectAll, setIsSelectAll] = useState(false);

    useEffect(() => {
      setData(groupedOptions);
    }, [id, groupedOptions]);

    const onChange = (_, selectedNodes) => {
      const isSelectAll = _.value === "select_all";
      let newData = [...data];

      if (isSelectAll) {
        newData = newData.map((obj, idx) => ({
          ...obj,
          checked: _.checked,
          children: obj.children.map((child) => ({
            ...child,
            checked: _.checked,
          })),
        }));

        setData(newData);

        if (_.checked) {
          // setIsSelectAll(true);
          updateAreaSelection(
            id,
            newData.map((node) => node.value)
          );
        } else {
          // setIsSelectAll(false);
          updateAreaSelection(id, []);
        }

        return;
      }

      const _id = _._id.split("-").pop();
      const _parent = _._parent ? _._parent.split("-").pop() : "not_exist";
      const _children = !!_._children;

      if (_children) {
        //parent exist
        newData[_id] = {
          ...newData[_id],
          checked: _.checked,
          children: newData[_id].children.map((child) => ({
            ...child,
            checked: _.checked,
          })),
        };
      } else {
        if (!_.checked) {
          newData[_parent].checked = false;
        }

        newData[_parent].expanded = true;

        newData[_parent].children[_id] = {
          ...newData[_parent].children[_id],
          checked: _.checked,
        };
      }

      if (
        selectedNodes.filter((node) => node._children?.length > 0).length ===
        newData.length - 1
      ) {
        // setIsSelectAll(true);
        newData[0] = {
          ...newData[0],
          checked: true,
        };
      } else {
        // setIsSelectAll(false);
        newData[0] = {
          ...newData[0],
          checked: false,
        };
      }

      setData(newData);

      updateAreaSelection(
        id,
        selectedNodes.map((node) => node.value)
      );
    };

    const onNodeToggle = (node) => {
      if (!node.isExpanded) {
        const newData = [...data];
        const idx = node._id.split("-").pop();
        const oldCities = newData[idx].children;
        const cities = citiesObj[node.value];

        if (oldCities.length > 0) {
          const newCities = cities.map((city) => {
            const oldCity = oldCities.find((c) => c.value === city.value);
            return {
              ...city,
              checked: !!oldCity,
            };
          });
          newData[idx] = {
            ...newData[idx],
            children: newCities,
            isExpanded: true,
            expanded: true,
          };
        } else {
          newData[idx] = {
            ...newData[idx],
            children: cities,
            isExpanded: true,
            expanded: true,
          };
        }
        setData(newData);
      }
    };

    return (
      <DropdownTreeSelect
        data={data}
        onChange={onChange}
        // onAction={onAction}
        onNodeToggle={onNodeToggle}
        clearSearchOnChange={true}
        texts={{
          placeholder: "Search...",
          inlineSearchPlaceholder: "Search...",
        }}
        keepTreeOnSearch={true}
        id={id}
        // showPartiallySelected={true}
        // className="bootstrap-demo"
      />
    );
  }
);

const Add = (props) => {
  const { id: shippingId } = props.match.params;

  const [areas, setAreas] = useState([
    {
      id: 0,
      addedId: null,
      selected: [],
      countries: null,
    },
  ]);

  const [nextId, setNextId] = useState(1);

  const [deletedIds, setDeletedIds] = useState([]);
  const [groupedOptions, setGroupedOptions] = useState([]);
  const [citiesObj, setCitiesObj] = useState({});

  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm();

  const { response, request } = useRequest();
  const { response: responseGet, request: requestGet } = useRequest();
  const { response: responseSubmit, request: requestSubmit } = useRequest();

  useEffect(() => {
    request("GET", "shipping-company/area/add-data");
  }, []);

  useEffect(() => {
    if (response) {
      requestGet("GET", `shipping-company/area/${shippingId}`);
      setGroupedOptions([
        {
          label: "Select All",
          value: "select_all",
          children: [],
          // actions: [
          //   {
          //     className: "fa fa-info",
          //     title: "Select all countries",
          //   },
          // ],
        },
        ...response.countries,
      ]);

      const citiesObj = {};

      response.countries.forEach((country) => {
        citiesObj[country.value] = country.children;
      });
      setCitiesObj(citiesObj);

      // const citiesObj = {};

      // const groupedOptions = response.countries.map((c) => {
      //   const options = c.cities;

      //   options.forEach((op) => {
      //     citiesObj[op.value] = op.label;
      //   });

      //   return {
      //     label: c.label,
      //     options,
      //   };
      // });

      // setGroupedOptions(groupedOptions);
      // setCitiesObj(citiesObj);
    }
  }, [response]);

  useEffect(() => {
    if (responseGet) {
      const addedAreas = responseGet.areas;

      if (addedAreas.length > 0) {
        const newData = addedAreas.map((area, idx) => {
          setValue(`area${idx}`, area.name);
          // setValue(`city${idx}`, area.areas);

          return {
            id: idx,
            addedId: area._id,
            // selected: area.areas.map((a) => a.value),
            selected: area.areas,
            countries: [
              {
                label: "Select All",
                value: "select_all",
                children: [],
                checked:
                  area.countries.filter((c) => c.checked).length ===
                  area.countries.length,
              },
              ...area.countries.map((country) => {
                if (!country.children) {
                  country.children = citiesObj[country.value];
                  country.isExpanded = true;
                }
                return country;
              }),
            ],
          };
        });

        setAreas(newData);

        setNextId(addedAreas.length);
      }
    }
  }, [responseGet]);

  useEffect(() => {
    if (responseSubmit) {
      toast.success(responseSubmit.message);
      history.push("/shipping-companies");
    }
  }, [responseSubmit]);

  const onSubmit = (data) => {
    const newAreas = [];
    const oldAreas = [];

    for (let i = 0; i < areas.length; i++) {
      const area = areas[i];
      const id = areas[i].id;
      // const cities = data[`city${id}`].map((c) => c.value);
      const cities = area.selected.filter((a) => a !== "select_all");
      const name = data[`area${id}`];

      if (cities.length == 0) {
        toast.error(`Please select in area ${name}`);
        return;
      }

      if (area.addedId) {
        oldAreas.push({
          id: area.addedId,
          name,
          areas: cities,
        });
      } else {
        newAreas.push({
          name,
          areas: cities,
          shippingId,
        });
      }
    }
    requestSubmit("PUT", "shipping-company/area", {
      newAreas,
      deletedAreas: deletedIds,
      oldAreas,
    });
  };

  const addAreaHandler = () => {
    setAreas((prev) => [
      ...prev,
      {
        id: nextId,
        addedId: null,
        selected: [],
        countries: null,
      },
    ]);
    setNextId((prev) => prev + 1);
  };

  const deleteAreaHandler = (id) => {
    const oldArea = areas.find((area) => area.id === id);

    if (oldArea.addedId) {
      setDeletedIds((prev) => [...prev, oldArea.addedId]);
    }

    const newAreas = [...areas].filter((area) => area.id !== id);
    setAreas(newAreas);
  };

  const updateAreaSelection = useCallback((id, selectedIds) => {
    // const newAreas = [...areas];
    // const idx = newAreas.find((area) => area.id == id);
    // newAreas[idx] = { ...newAreas[idx], selected: selectedIds };
    // setAreas(newAreas);

    setAreas((prev) =>
      prev.map((p) => (+p.id === +id ? { ...p, selected: selectedIds } : p))
    );
  }, []);

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Areas"
        links={[
          { to: "/", name: "Dashboard" },
          { to: `/shipping-companies`, name: "Back To Shipping Companies" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Areas</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <button
                      class="btn btn-primary mr-2 mb-2 fixedButtonAdd2 zindex-1"
                      type="button"
                      onClick={addAreaHandler}
                    >
                      Add Area <i class="fas fa-plus p-0"></i>
                    </button>

                    {areas.map((area) => (
                      <Fragment key={area.id}>
                        <div className="row mt-3">
                          <div className="col-xl-3">
                            <MutliInput
                              type="text"
                              label="Area Name"
                              name={`area${area.id}`}
                              errors={errors}
                              placeholder="Area Name"
                              register={register}
                              registerFields={{
                                required: true,
                              }}
                            />
                          </div>

                          {/* <div className="col-xl-6">
                            <CitySelect
                              name={`city${area.id}`}
                              groupedOptions={groupedOptions}
                              errors={errors}
                              control={control}
                              setValue={setValue}
                              alreadySelectedOptions={area.selected}
                              citiesObj={citiesObj}
                            />
                          </div> */}

                          <div className="col-xl-6">
                            <CitySelectTwo
                              groupedOptions={area.countries || groupedOptions}
                              id={area.id.toString()}
                              updateAreaSelection={updateAreaSelection}
                              citiesObj={citiesObj}
                            />
                          </div>

                          {areas.length > 1 && (
                            <ButtonComp
                              classes="btn btn-bg-danger ml-2 mt-2"
                              onClick={() => deleteAreaHandler(area.id)}
                            >
                              {/* <i class="fas fa-trash-alt text-white"></i> */}
                              Delete Area
                            </ButtonComp>
                          )}
                        </div>
                        <hr />
                      </Fragment>
                    ))}

                    <div className="row"></div>

                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmit}
                      name="Submit"
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Add;

/*
const oldData = [
  {
    "children": [
      {
        "label": "Herat",
        "value": "6515261601fd174be7c6da5f",
        "checked": true
      }
    ],
    "label": "Afghanistan",
    "value": "6515261601fd174be7c6da5d",
    "checked": false
  },
  {
    "children": [],
    "label": "Afghanistan 1",
    "value": "6515261601fd174be7c6da51",
    "checked": true
  }
];

const cities = [
  {
    "label": "Herat",
    "value": "6515261601fd174be7c6da5f",
    "checked": false
  },
  {
    "label": "Kandahar",
    "value": "6515261601fd174be7c6da61",
    "checked": false
  },
  {
    "label": "Rana",
    "value": "6515261601fd174be7c6da63",
    "checked": false
  }
]

const idx = oldData.findIndex(o => o.value === "6515261601fd174be7c6da51");
const oldCities = oldData[idx].children;

if(oldCities.length > 0){
    const newCities = cities.map(city => {
      const oldCity = oldCities.find(c => c.value == city.value);
      return {
        ...city,
        checked: !!oldCity
      }
    })
    oldData[idx] = {...oldData[idx], children:newCities }
} else {
    oldData[idx] = {...oldData[idx], children:cities }
}

// console.log("oldData", oldData)

https://github.com/dowjones/react-dropdown-tree-select/issues/36

https://github.com/dowjones/react-dropdown-tree-select/issues?page=5&q=is%3Aclosed
*/
