import { useField } from "formik";

export default function InputField({
  label,
  description,
  ...props
}: {
  label: string;
  description?: string;
  name: string;
  required?: boolean;
  type: string;
}) {
  const [field, meta, helpers] = useField(props);

  return (
    <div className="mb-10">
      <label htmlFor={props.name}>
        {label}
        {props.required && "*"}
        {description && (
          <span className="label-description">{description}</span>
        )}
      </label>

      <input {...field} {...props} className="pill-input" />

      {meta.touched && meta.error ? (
        <span className="text-red mt-2">{meta.error}</span>
      ) : null}
    </div>
  );
}
