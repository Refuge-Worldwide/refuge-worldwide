import * as React from "react";
import { useState } from "react";
import Select from "react-select";
import { useField, useFormikContext } from "formik";

interface Option {
  value: string;
  label: string;
  email?: string[];
}

interface MultiSelectFieldProps {
  label: string;
  description?: string;
  name: string;
  required?: boolean;
  value?: Option[];
  options: Option[];
  limit?: number;
}

export function MultiSelectField({
  label,
  description,
  options,
  limit,
  value,
  ...props
}: MultiSelectFieldProps) {
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(value ?? []);
  const [field, meta] = useField(props);
  const { setFieldValue } = useFormikContext();

  const onChange = (opts: readonly Option[] | Option | null) => {
    const arr =
      opts == null
        ? []
        : Array.isArray(opts)
        ? Array.from(opts)
        : [opts as Option];
    setFieldValue(props.name, arr);
    setSelectedOptions(arr);
  };

  return (
    <div className="mb-10">
      <label htmlFor={props.name}>
        {label}
        {props.required && "*"}
        {description && (
          <span className="label-description">{description}</span>
        )}
      </label>
      <Select
        aria-label={label}
        options={options}
        isMulti={!limit || limit > 1}
        className="basic-multi-select pill-input mb-2 p-2"
        value={selectedOptions}
        onChange={onChange}
        isOptionDisabled={() =>
          limit != null && limit !== 1 && selectedOptions.length >= limit
        }
        name={props.name}
        id={props.name}
        classNamePrefix="select"
        styles={{
          control: (base) => ({
            ...base,
            borderColor: "transparent",
            backgroundColor: "transparent",
          }),
        }}
      />
      {meta.touched && meta.error && (
        <span className="text-red mt-2 text-small">{meta.error}</span>
      )}
    </div>
  );
}
