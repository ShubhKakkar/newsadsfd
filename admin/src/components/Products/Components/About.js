import { useSelector } from "react-redux";

import {
  SubTab as SubTabForm,
  SubInput as SubInputForm,
} from "../../Form/Form";

export const About = ({
  errors,
  register,
  DescInputFields,
  isOptional = false,
}) => {
  const { languages } = useSelector((state) => state.setting);

  return (
    <div
      className="tab-pane fade"
      id="kt_tab_pane_3"
      role="tabpanel"
      aria-labelledby="kt_tab_pane_3"
      style={{ minHeight: 490 }}
    >
      <div>
        <h3 className="mb-10 font-weight-bold text-dark">About</h3>
      </div>{" "}
      <>
        <div className="card-header card-header-tabs-line pl-0 pr-0 pt-0">
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
                    tabName={index + "_first"}
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
                    required={lang.required ? !isOptional : false}
                    InputFields={DescInputFields}
                    code={lang.code}
                    tabName={index + "_first"}
                  />
                ))}
            </div>
          </div>
        </div>
      </>
    </div>
  );
};
