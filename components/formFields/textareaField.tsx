import { useField } from "formik";

export default function TextareaField({
  label,
  rows,
  description,
  ...props
}: {
  label: string;
  rows: number;
  name: string;
  description?: string;
  required?: boolean;
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
      <textarea {...field} {...props} rows={rows} className="pill-input" />
      {meta.touched && meta.error ? (
        <span className="text-red mt-2 text-small">{meta.error}</span>
      ) : null}
    </div>
  );
}
