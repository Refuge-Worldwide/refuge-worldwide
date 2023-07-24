import { useField } from "formik";

export default function RadioField({
  label,
  description,
  size,
  value,
  ...props
}: {
  label: string;
  description?: string;
  name: string;
  size?: string;
  value?: string;
}) {
  const [field, meta, helpers] = useField(props);

  return (
    <label className="space-x-3 text-base flex items-center">
      <input
        type="radio"
        id={props.name}
        value={value}
        {...field}
        {...props}
        className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
      />
      <span>{label}</span>
    </label>
  );
}
