export default function DateField({
  label,
  name,
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="mb-10">
      <label htmlFor={name}>
        {label}
        {required && "*"}
      </label>
      <input
        type="date"
        id={name}
        name={name}
        className="pill-input"
        required={required}
      />
    </div>
  );
}
