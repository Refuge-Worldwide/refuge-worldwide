export default function TextareaField({
  label,
  name,
  required,
  rows,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows: number;
}) {
  return (
    <div className="mb-10">
      <label htmlFor={name}>
        {label}
        {required && "*"}
      </label>
      <textarea
        rows={rows}
        id={name}
        name={name}
        className="pill-input"
        required={required}
      />
    </div>
  );
}
