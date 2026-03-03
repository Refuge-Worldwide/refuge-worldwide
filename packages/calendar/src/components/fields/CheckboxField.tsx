import { useField } from "formik";
import * as React from "react";

interface CheckboxFieldProps {
  label: string;
  description?: string;
  name: string;
  required?: boolean;
  size?: "small" | "default";
  className?: string;
}

export function CheckboxField({
  label,
  description,
  size,
  className,
  ...props
}: CheckboxFieldProps) {
  const [field] = useField({ ...props, type: "checkbox" });

  return (
    <div
      className={`${className ?? ""} ${
        size === "small" ? "-mt-4" : ""
      } flex space-x-3 text-base mb-10 items-top`}
    >
      <input
        type="checkbox"
        id={props.name}
        {...field}
        checked={field.value === true}
        className="h-6 w-6 mt-1 rounded-full border-2 border-black text-black focus:ring-black"
      />
      <label
        htmlFor={props.name}
        className={`${
          size === "small" ? "text-small mt-1.5" : "text-small sm:text-base"
        } sm:leading-none checkbox-label`}
      >
        {label}
        {props.required && "*"}
      </label>
    </div>
  );
}
