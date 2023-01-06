import { useState } from "react";
import Select, { AriaOnFocus } from "react-select";

export default function MultiSelectField({
  label,
  name,
  required,
  options,
  limit,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  limit?: number;
}) {
  const [ariaFocusMessage, setAriaFocusMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const onFocus = ({ focused, isDisabled }) => {
    const msg = `You are currently focused on option ${focused.label}${
      isDisabled ? ", disabled" : ""
    }.`;
    setAriaFocusMessage(msg);
    return msg;
  };

  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  return (
    <div className="mb-6">
      <label htmlFor={name} id="aria-label">
        {label}
        {required && "*"}
      </label>
      <Select
        aria-labelledby="aria-label"
        ariaLiveMessages={{
          onFocus,
        }}
        options={options}
        isMulti
        className="basic-multi-select pill-input mb-6"
        value={selectedOptions}
        onChange={(o) => setSelectedOptions(o)}
        isOptionDisabled={() => selectedOptions.length >= limit}
        name={name}
        id={name}
        classNamePrefix="select"
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
      />
    </div>
  );
}
