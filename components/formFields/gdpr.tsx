import CheckboxField from "./checkboxField";

export default function GDPR() {
  return (
    <CheckboxField
      required={true}
      name="gdpr"
      label="I agree to my details being stored for the purpose of this workshop. All your data will be deleted at the end of the workshop. If you agree to this, please tick the box. This is in line with GDPR regulations."
    />
  );
}
