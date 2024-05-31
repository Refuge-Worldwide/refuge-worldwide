import { useState } from "react";
import { useField, useFormikContext } from "formik";
import { AsyncPaginate } from "react-select-async-paginate";

export default function ArtistMultiSelectField({
  label,
  description,
  limit,
  value,
  includeEmail,
  ...props
}: {
  label: string;
  description?: string;
  name: string;
  required?: boolean;
  value?: Array<{ value: string; label: string; email?: [string] }>;
  limit?: number;
  includeEmail?: boolean;
}) {
  // const [ariaFocusMessage, setAriaFocusMessage] = useState("");
  const [selectedOptions, SetSelectedOptions] = useState(value ? value : []);
  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [field, meta, helpers] = useField(props);
  const { setFieldValue } = useFormikContext();
  const fetchUrl = includeEmail
    ? `/api/admin/search?query=${query}&type=artists`
    : `/api/artist-search?query=${query}`;

  const onSetSelectedOptions = (options) => {
    setFieldValue(props.name, options);
    SetSelectedOptions(options);
  };

  const loadOptions = async () => {
    console.log("searching artists " + query);
    const res = await fetch(fetchUrl);
    const data = await res.json();

    return {
      options: data,
      hasMore: false,
    };
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
      <AsyncPaginate
        aria-label={label}
        aria-description={description}
        loadOptions={loadOptions}
        isMulti={!limit || limit > 1}
        className="basic-multi-select pill-input mb-2 p-2"
        value={selectedOptions}
        onChange={(o) => onSetSelectedOptions(o)}
        onInputChange={(value) => setQuery(value)}
        isOptionDisabled={() => selectedOptions.length >= limit && limit != 1}
        name={props.name}
        id={props.name}
        classNamePrefix="select"
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
        debounceTimeout={300}
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
