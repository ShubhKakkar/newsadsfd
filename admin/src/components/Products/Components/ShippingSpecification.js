import { RenderInputFields, Input, ReactSelectInputTwo } from "../../Form/Form";

export const ShippingSpecification = ({
  errors,
  register,
  isOptional = false,
  control,
  shippingCompanies,
}) => {
  const ShippingInputFields = [
    [
      {
        Component: Input,
        label: "Height",
        type: "text",
        name: "height",
        registerFields: {
          required: !isOptional,
          pattern: /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
        },
        registerFieldsFeedback: {
          pattern: "Please enter digits only.",
        },
      },
      {
        Component: Input,
        label: "Weight",
        type: "text",
        name: "weight",
        registerFields: {
          required: !isOptional,
          pattern: /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
        },
        registerFieldsFeedback: {
          pattern: "Please enter digits only.",
        },
      },
      {
        Component: Input,
        label: "Width",
        type: "text",
        name: "width",
        registerFields: {
          required: !isOptional,
          pattern: /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
        },
        registerFieldsFeedback: {
          pattern: "Please enter digits only.",
        },
      },
      {
        Component: Input,
        label: "Length",
        type: "text",
        name: "length",
        registerFields: {
          required: !isOptional,
          pattern: /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
        },
        registerFieldsFeedback: {
          pattern: "Please enter digits only.",
        },
      },
      {
        Component: Input,
        label: "DC",
        type: "text",
        name: "dc",
        registerFields: {
          required: !isOptional,
        },
      },
      // {
      //   Component: Input,
      //   label: "Shipping Company",
      //   type: "text",
      //   name: "shippingCompany",
      //   registerFields: {
      //     required: !isOptional,
      //   },
      // },
      {
        Component: ReactSelectInputTwo,
        label: "Shipping Company",
        name: "shippingCompany",
        registerFields: {
          required: !isOptional,
        },
        control,
        options: shippingCompanies,
      },
    ],
  ];

  return (
    <div
      className="tab-pane fade"
      id="kt_tab_pane_6"
      role="tabpanel"
      aria-labelledby="kt_tab_pane_6"
      style={{ minHeight: 490 }}
    >
      <div>
        <h3 className="mb-10 font-weight-bold text-dark">
          Shipping Specifications
        </h3>
      </div>
      <RenderInputFields
        InputFields={ShippingInputFields}
        errors={errors}
        register={register}
      />
    </div>
  );
};
