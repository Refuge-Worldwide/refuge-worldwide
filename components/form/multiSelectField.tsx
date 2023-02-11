import { useState } from "react";
import Select, { AriaOnFocus, OnChangeValue } from "react-select";
import { useField } from "formik";

export default function MultiSelectField({
  label,
  description,
  name,
  required,
  options,
  limit,
  setOptions,
}: {
  label: string;
  description?: string;
  name: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  limit?: number;
  setOptions: (arg: Array<{ value: string; label: string }>) => void;
}) {
  const [ariaFocusMessage, setAriaFocusMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<any>([]);

  const onFocus = ({ focused, isDisabled }) => {
    const msg = `You are currently focused on option ${focused.label}${
      isDisabled ? ", disabled" : ""
    }.`;
    setAriaFocusMessage(msg);
    return msg;
  };

  const onSetSelectedOptions = (options) => {
    setSelectedOptions(options);
    setOptions(options);
  };

  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  return (
    <div>
      <label htmlFor={name} id="aria-label">
        {label}
        {required && "*"}
        <span className="label-description">{description}</span>
      </label>
      <Select
        aria-labelledby="aria-label"
        ariaLiveMessages={{
          onFocus,
        }}
        options={options}
        isMulti
        className="basic-multi-select pill-input mb-2 p-2"
        value={selectedOptions}
        onChange={(o) => onSetSelectedOptions(o)}
        isOptionDisabled={() => selectedOptions.length >= limit}
        name={name}
        id={name}
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
    </div>
  );
}
