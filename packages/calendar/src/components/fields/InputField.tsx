import { useField } from "formik";
import * as React from "react";

interface InputFieldProps {
  label: string;
  description?: string;
  name: string;
  required?: boolean;
  type: string;
  value?: string;
  hidden?: boolean;
}

export function InputField({ label, description, ...props }: InputFieldProps) {
  const [field, meta] = useField(props);

  return (
    <div className="mb-10">
      <label htmlFor={props.name}>
        {label}
        {props.required && "*"}
        {description && (
          <span className="label-description">{description}</span>
        )}
      </label>
      <input
        {...field}
        {...props}
        className={`pill-input ${
          meta.touched && meta.error ? "border-red shadow-red" : ""
        }`}
      />
      {meta.touched && meta.error && (
        <span className="text-red mt-2 text-small">{meta.error}</span>
      )}
    </div>
  );
}
