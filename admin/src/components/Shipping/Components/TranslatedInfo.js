import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Fragment } from "react";

import {
  SubTab as SubTabForm,
  SubInput as SubInputForm,
  MutliInput,
  ButtonComp,
  Input,
  Textarea,
} from "../../Form/Form";

const DescInputFields = [
  [
    {
      Component: Textarea,
      label: "Shipping info",
      type: "text",
      name: "shippingInfo",
      registerFields: {
        required: false,
      },
      colClass: "col-xl-12",
    },
  ],
];

export const TranslatedInfo = ({
  errors,
  register,
  instructions,
  setInstructions,
  rules,
  setRules,
  unregister,
  isEdit,
}) => {
  const [instructionNextId, setInstructionNextId] = useState(1);
  const [ruleNextId, setRuleNextId] = useState(1);

  const { languages } = useSelector((state) => state.setting);

  useEffect(() => {
    if (isEdit) {
      setInstructionNextId(instructions.length);
      setRuleNextId(rules.length);
    }
  }, [isEdit]);

  const addInstruction = () => {
    setInstructions((prev) => [...prev, instructionNextId]);
    setInstructionNextId((prev) => prev + 1);
  };

  const deleteInstruction = (id) => {
    const newInstructions = [...instructions].filter((f) => f !== id);
    setInstructions(newInstructions);

    // unregister(`instruction${id}`);
  };

  const addRule = () => {
    setRules((prev) => [...prev, ruleNextId]);
    setRuleNextId((prev) => prev + 1);
  };

  const deleteRule = (id) => {
    const newRules = [...rules].filter((f) => f !== id);
    setRules(newRules);

    // unregister(`rule${id}`);
  };

  //name(text), shipping info(texarea), instructions(+), rules(+)
  return (
    <div
      className="tab-pane fade"
      id="kt_tab_pane_2"
      role="tabpanel"
      aria-labelledby="kt_tab_pane_2"
      style={{ minHeight: 490 }}
    >
      <Fragment>
        <div className="card-header card-header-tabs-line pl-0 pr-0">
          <div className="card-toolbar">
            <ul
              className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
              role="tablist"
            >
              {languages.length > 0 &&
                languages.map((lang, index) => (
                  <SubTabForm
                    key={index}
                    name={lang.name}
                    index={index}
                    image={lang?.image}
                    tabName={`language_${index}`}
                    onClick={(idx) => {
                      ["about", "meta"].forEach((id) => {
                        const ele = document.querySelector(
                          `[href="#kt_apps_contacts_view_tab_${id}_${idx}"]`
                        );
                        if (ele) {
                          ele.click();
                        }
                      });
                    }}
                  />
                ))}
            </ul>
          </div>
        </div>

        <div className="mt-5">
          <div className="card-body pl-0 pr-0 p-0">
            <div className="tab-content">
              {languages.length > 0 &&
                languages.map((lang, index) => (
                  <SubInputForm
                    key={index}
                    index={index}
                    errors={errors}
                    register={register}
                    required={lang.required}
                    InputFields={[
                      [
                        {
                          Component: Input,
                          label: "Name",
                          type: "text",
                          name: "name",
                          //   isRequired: true,
                        },
                      ],
                    ]}
                    code={lang.code}
                    tabName={`language_${index}`}
                  />
                ))}
            </div>
          </div>
        </div>
      </Fragment>
      {/* SHIPPING INFO STARTS */}
      {/* <div>
        <h3 className="font-weight-bold text-dark">About</h3>
      </div> */}
      <>
        <div className="card-header card-header-tabs-line pl-0 pr-0 pt-0 d-none">
          <div className="card-toolbar">
            <ul
              className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
              role="tablist"
            >
              {languages.length > 0 &&
                languages.map((lang, index) => (
                  <SubTabForm
                    key={index}
                    name={lang.name}
                    index={index}
                    tabName={`about_${index}`}
                    image={lang?.image}
                  />
                ))}
            </ul>
          </div>
        </div>
        <div className="mt-5">
          <div className="card-body px-0">
            <div className="tab-content ">
              {languages.length > 0 &&
                languages.map((lang, index) => (
                  <SubInputForm
                    key={index}
                    index={index}
                    errors={errors}
                    register={register}
                    required={lang.required}
                    InputFields={DescInputFields}
                    code={lang.code}
                    tabName={`about_${index}`}
                    // tabName={`language_${index}`}
                  />
                ))}
            </div>
          </div>
        </div>
      </>
      {/* Instructions STARTS */}
      <div className="mt-10">
        <h3 className="mb-10 font-weight-bold text-dark">Instructions</h3>
      </div>
      <div className="col-xl-12 p-0">
        <div className="form-group">
          <label className="mr-5">Instruction</label>
          <button
            onClick={addInstruction}
            className="btn btn-primary mr-2"
            type="button"
          >
            <i class="fas fa-plus p-0"></i>
          </button>

          {instructions.map((instruction) => (
            <Fragment key={instruction}>
              <div className="card-header card-header-tabs-line pl-0 pr-0">
                <div className="card-toolbar">
                  <ul
                    className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                    role="tablist"
                  >
                    {languages.length > 0 &&
                      languages.map((lang, index) => (
                        <SubTabForm
                          key={index}
                          name={lang.name}
                          index={index}
                          tabName={"instruction_" + index + "_" + instruction}
                          image={lang?.image}
                        />
                      ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5">
                <div className="card-body pl-0 pr-0 p-0">
                  <div className="tab-content sameRowInput">
                    {languages.length > 0 &&
                      languages.map((lang, index) => (
                        <SubInputForm
                          key={index}
                          index={index}
                          errors={errors}
                          register={register}
                          required={lang.required}
                          InputFields={[
                            [
                              {
                                Component: MutliInput,
                                type: "text",
                                label: "Instruction",
                                name: `instruction${instruction}`,
                                placeholder: `Enter Instruction (${lang.name})`,
                              },
                              {
                                Component: ButtonComp,
                                children: <i class="fas fa-trash-alt"></i>,
                                onClick: () => deleteInstruction(instruction),
                                classes: "btn btn-bg-danger ml-2",
                              },
                            ],
                          ]}
                          code={lang.code}
                          tabName={"instruction_" + index + "_" + instruction}
                          // tabName={`language_${index}`}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Rules STARTS */}

      <div className="mt-10">
        <h3 className="mb-10 font-weight-bold text-dark">Rules</h3>
      </div>
      <div className="col-xl-12 p-0">
        <div className="form-group">
          <label className="mr-5">Rule</label>
          <button
            onClick={addRule}
            className="btn btn-primary mr-2"
            type="button"
          >
            <i class="fas fa-plus p-0"></i>
          </button>

          {rules.map((rule) => (
            <Fragment key={rule}>
              <div className="card-header card-header-tabs-line pl-0 pr-0">
                <div className="card-toolbar">
                  <ul
                    className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                    role="tablist"
                  >
                    {languages.length > 0 &&
                      languages.map((lang, index) => (
                        <SubTabForm
                          key={index}
                          name={lang.name}
                          index={index}
                          tabName={"rule_" + index + "_" + rule}
                          image={lang?.image}
                        />
                      ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5">
                <div className="card-body pl-0 pr-0 p-0">
                  <div className="tab-content sameRowInput">
                    {languages.length > 0 &&
                      languages.map((lang, index) => (
                        <SubInputForm
                          key={index}
                          index={index}
                          errors={errors}
                          register={register}
                          required={lang.required}
                          InputFields={[
                            [
                              {
                                Component: MutliInput,
                                type: "text",
                                label: "Rule",
                                name: `rule${rule}`,
                                placeholder: `Enter Rule (${lang.name})`,
                              },
                              {
                                Component: ButtonComp,
                                children: <i class="fas fa-trash-alt"></i>,
                                onClick: () => deleteRule(rule),
                                classes: "btn btn-bg-danger ml-2",
                              },
                            ],
                          ]}
                          code={lang.code}
                          tabName={"rule_" + index + "_" + rule}
                          // tabName={`language_${index}`}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
