import { Field, ErrorMessage, useFormikContext } from "formik";
import * as RadioGroup from "@radix-ui/react-radio-group";

export default function ShowSubmissionStep1() {
  const { setFieldValue } = useFormikContext();
  return (
    // We pass the event to the handleSubmit() function on submit.
    <div className="mt-16 mb-8">
      <fieldset>
        <legend>First up, is your show...*</legend>
        <RadioGroup.Root
          className="flex"
          name="Type of show"
          onValueChange={(value: string) => setFieldValue("showType", value)}
        >
          <RadioGroup.Item value="live" asChild>
            <label className="data-[state=checked]:bg-orange block cursor-pointer pill-input rounded-tr-none rounded-br-none py-3 text-center">
              Live
            </label>
          </RadioGroup.Item>

          <RadioGroup.Item value="preRecord" asChild>
            <label className="data-[state=checked]:bg-blue block cursor-pointer select-none pill-input rounded-tl-none rounded-bl-none py-3 text-center">
              Pre-record
            </label>
          </RadioGroup.Item>
        </RadioGroup.Root>
        {/* <div className="flex">
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
              Pre-recorded
            </label>
          </div>
        </div> */}
        <ErrorMessage className="text-red" component="span" name="showType" />
      </fieldset>
    </div>
  );
}
