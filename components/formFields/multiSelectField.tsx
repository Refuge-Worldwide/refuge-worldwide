import { useState } from "react";
import Select, { AriaOnFocus, OnChangeValue } from "react-select";
import { useField, useFormikContext } from "formik";

export default function MultiSelectField({
  label,
  description,
  options,
  limit,
  value,
  ...props
}: {
  label: string;
  description?: string;
  name: string;
  required?: boolean;
  value?: Array<{ value: string; label: string; email?: [string] }>;
  options: Array<{ value: string; label: string; email?: [string] }>;
  limit?: number;
}) {
  const [ariaFocusMessage, setAriaFocusMessage] = useState("");
  const [selectedOptions, SetSelectedOptions] = useState(value ? value : []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [field, meta, helpers] = useField(props);
  const { setFieldValue } = useFormikContext();

  const onFocus = ({ focused, isDisabled }) => {
    const msg = `You are currently focused on option ${focused.label}${
      isDisabled ? ", disabled" : ""
    }.`;
    setAriaFocusMessage(msg);
    return msg;
  };

  const onSetSelectedOptions = (options) => {
    setFieldValue(props.name, options);
    SetSelectedOptions(options);
  };

  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  return (
    <div className="mb-10">
      <label htmlFor={props.name} id="aria-label">
        {label}
        {props.required && "*"}
        <span className="label-description">{description}</span>
      </label>
      <Select
        aria-labelledby="aria-label"
        ariaLiveMessages={{
          onFocus,
        }}
        options={options}
        isMulti={limit != 1}
        className="basic-multi-select pill-input mb-2 p-2"
        value={selectedOptions}
        onChange={(o) => onSetSelectedOptions(o)}
        isOptionDisabled={() => selectedOptions.length >= limit && limit != 1}
        name={props.name}
        id={props.name}
        classNamePrefix="select"
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: "transparent",
            backgroundColor: "transparent",
            indicatorSeparator: "transparent",
          }),
        }}
      />
      {meta.touched && meta.error ? (
        <span className="text-red mt-2 text-small">{meta.error}</span>
      ) : null}
    </div>
  );
}
