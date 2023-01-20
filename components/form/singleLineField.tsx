export default function SingleLineField({
  label,
  name,
  required,
  type,
}: {
  label: string;
  name: string;
  required?: boolean;
  type: string;
}) {
  return (
    <div className="mb-10">
      <label htmlFor={name}>
        {label}
        {required && "*"}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        className="pill-input"
        required={required}
      />
    </div>
  );
}
