import { useSelector } from "react-redux";
import {
  RenderInputFields,
  InputTag,
  Input,
  Textarea,
  SubTab,
  SubInput,
} from "../../Form/Form";

export const SEOInputFields = [
  [
    {
      Component: Input,
      label: "Meta Title",
      type: "text",
      name: "metaData.title",
      registerFields: {
        required: false,
      },
    },
    {
      Component: Input,
      label: "Author",
      type: "text",
      name: "metaData.author",
      registerFields: {
        required: false,
      },
    },
    {
      Component: Textarea,
      label: "Meta Description",
      type: "text",
      name: "metaData.description",
      registerFields: {
        required: false,
      },
      colClass: "col-xl-12",
    },
    // {
    //   Component: Input,
    //   label: "Author",
    //   type: "text",
    //   name: "metaData.author",
    //   registerFields: {
    //     required: false,
    //   },
    // },
    // {
    //   Component: Input,
    //   label: "Keywords",
    //   type: "text",
    //   name: "metaData.keywords",
    //   registerFields: {
    //     required: false,
    //   },
    // },
    {
      Component: InputTag,
      label: "Keywords",
      name: "metaData.keywords",
      registerFields: {
        required: false,
        setValueAs: (v) => v.trim(),
      },
      colClass: "col-xl-12",
      placeholder: "Enter Keywords",
    },
    // {
    //   Component: Textarea,
    //   label: "Twitter Card",
    //   type: "text",
    //   name: "metaData.twitterCard",
    //   registerFields: {
    //     required: false,
    //   },
    //   colClass: "col-xl-12",
    // },
    // {
    //   Component: Input,
    //   label: "Twitter Site",
    //   type: "text",
    //   name: "metaData.twitterSite",
    //   registerFields: {
    //     required: false,
    //   },
    // },
    // {
    //   Component: Input,
    //   label: "OG Url",
    //   type: "text",
    //   name: "metaData.ogUrl",
    //   registerFields: {
    //     required: false,
    //   },
    // },
    // {
    //   Component: Input,
    //   label: "OG Type",
    //   type: "text",
    //   name: "metaData.ogType",
    //   registerFields: {
    //     required: false,
    //   },
    // },
    // {
    //   Component: Input,
    //   label: "OG Title",
    //   type: "text",
    //   name: "metaData.ogTitle",
    //   registerFields: {
    //     required: false,
    //   },
    // },
    // {
    //   Component: Textarea,
    //   label: "OG Description",
    //   type: "text",
    //   name: "metaData.ogDescription",
    //   registerFields: {
    //     required: false,
    //   },
    //   colClass: "col-xl-12",
    // },
    // {
    //   Component: Input,
    //   label: "Og Image",
    //   name: "ogImage",
    //   registerFields: {
    //     required: false,
    //   },
    //   type: "file",
    //   inputData: {
    //     accept: "image/*",
    //   },
    // },
    // {
    //   Component: Input,
    //   label: "OG Tag",
    //   type: "text",
    //   name: "metaData.ogTag",
    //   registerFields: {
    //     required: false,
    //   },
    // },
    // {
    //   Component: Input,
    //   label: "OG Alt Tag",
    //   type: "text",
    //   name: "metaData.ogAltTag",
    //   registerFields: {
    //     required: false,
    //   },
    // },
  ],
];

export const ProductMeta = ({ errors, register, control }) => {
  const { languages } = useSelector((state) => state.setting);
  return (
    <div
      className="tab-pane fade"
      id="kt_tab_pane_8"
      role="tabpanel"
      aria-labelledby="kt_tab_pane_8"
      style={{ minHeight: 490 }}
    >
      <div>
        <h3 className="mb-10 font-weight-bold text-dark">Product Meta</h3>
      </div>
      {/* <RenderInputFields
        InputFields={SEOInputFields}
        errors={errors}
        register={register}
      /> */}

      <div className="card card-custom gutter-b">
        <div className="card-header card-header-tabs-line">
          <div className="card-toolbar">
            <ul
              className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
              role="tablist"
            >
              {languages.length > 0 &&
                languages.map((lang, index) => (
                  <SubTab
                    key={index}
                    name={lang.name}
                    index={index}
                    image={lang?.image}
                    tabName={`meta_${index}`}
                  />
                ))}
            </ul>
          </div>
        </div>

        <div className="card-body px-0">
          <div className="tab-content px-10">
            {languages.length > 0 &&
              languages.map((lang, index) => (
                <SubInput
                  key={index}
                  index={index}
                  errors={errors}
                  register={register}
                  required={false}
                  InputFields={SEOInputFields}
                  code={lang.code}
                  tabName={`meta_${index}`}
                  control={control}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
