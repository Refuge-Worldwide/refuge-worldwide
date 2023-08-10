import { Field, ErrorMessage } from "formik";

export default function ShowSubmissionStep1() {
  return (
    // We pass the event to the handleSubmit() function on submit.
    <div className="mt-16 mb-8">
      <fieldset>
        <legend>First up, is your show...*</legend>
        <div className="flex">
          <div className="w-1/2">
            <Field
              type="radio"
              id="live"
              name="showType"
              value="live"
              className="peer hidden"
            />
            <label
              htmlFor="live"
              className="block cursor-pointer select-none pill-input rounded-tr-none rounded-br-none py-3 text-center peer-checked:bg-orange peer-checked:font-bold"
            >
              Live
            </label>
          </div>
          <div className="w-1/2">
            <Field
              type="radio"
              id="preRecord"
              name="showType"
              value="preRecord"
              className="peer hidden"
            />
            <label
              htmlFor="preRecord"
              className="block cursor-pointer select-none pill-input rounded-tl-none rounded-bl-none py-3 text-center peer-checked:bg-blue peer-checked:font-bold"
            >
              Pre-record
            </label>
          </div>
        </div>
        <ErrorMessage className="text-red" component="span" name="showType" />
      </fieldset>
    </div>
  );
}
