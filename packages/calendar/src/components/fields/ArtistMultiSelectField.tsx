import * as React from "react";
import { useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { useField, useFormikContext } from "formik";

interface Option {
  value: string;
  label: string;
  email?: string[];
}

interface ArtistMultiSelectFieldProps {
  label: string;
  description?: string;
  name: string;
  required?: boolean;
  value?: Option[];
  limit?: number;
  /** Endpoint to fetch artists from. Default: /api/admin/search */
  searchEndpoint?: string;
}

export function ArtistMultiSelectField({
  label,
  description,
  limit,
  value,
  searchEndpoint = "/api/admin/search",
  ...props
}: ArtistMultiSelectFieldProps) {
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(value ?? []);
  const [query, setQuery] = useState("");
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

  const loadOptions = async () => {
    const res = await fetch(
      `${searchEndpoint}?query=${encodeURIComponent(query)}&type=artists`
    );
    const data = await res.json();
    return { options: data as Option[], hasMore: false };
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
      <AsyncPaginate
        aria-label={label}
        loadOptions={loadOptions}
        isMulti={!limit || limit > 1}
        className="basic-multi-select pill-input mb-2 p-2"
        value={selectedOptions}
        onChange={onChange}
        onInputChange={(v) => setQuery(v)}
        isOptionDisabled={() =>
          limit != null && limit !== 1 && selectedOptions.length >= limit
        }
        name={props.name}
        id={props.name}
        classNamePrefix="select"
        debounceTimeout={300}
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
