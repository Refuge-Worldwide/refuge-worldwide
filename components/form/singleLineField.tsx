export default function SingleLineField({
  label,
  name,
  required,
  type,
  description,
}: {
  label: string;
  name: string;
  required?: boolean;
  type: string;
  description?: string;
}) {
  return (
    <div className="mb-10">
      <label htmlFor={name}>
        {label}
        {required && "*"}
        <span className="label-description">{description}</span>
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
