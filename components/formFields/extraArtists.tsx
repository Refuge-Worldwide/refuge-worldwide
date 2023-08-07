import { useState } from "react";
import ImageUploadField from "./imageUploadField";
import { Close } from "../../icons/menu";
import TextareaField from "./textareaField";
import CheckboxField from "./checkboxField";
import InputField from "./inputField";
import { useFormikContext, FieldArray } from "formik";
import { SubmissionFormValues } from "../../types/shared";

export default function ExtraArtists() {
  const { values } = useFormikContext<SubmissionFormValues>();

  return (
    <div>
      <CheckboxField
        name="hasExtraArtists"
        label="Can't find your artist/guest/collective in the dropdown?"
        size="small"
      />

      {values.hasExtraArtists && (
        <fieldset className=" mb-8">
          <legend className="mb-6">Additional artist(s)</legend>
          <FieldArray
            name="extraArtists"
            render={(arrayHelpers) => (
              <div>
                {values.extraArtists &&
                  values.extraArtists.map((extraArtist, index) => (
                    <div
                      className="mb-8 border border-black p-8 relative"
                      key={"extraArtist" + index}
                    >
                      {index > 0 && (
                        <button
                          className="float-right"
                          onClick={() => arrayHelpers.remove(index)}
                          type="button"
                        >
                          <Close size={24} />
                        </button>
                      )}
                      <InputField
                        name={`extraArtists.${index}.name`}
                        type="text"
                        label="Name"
                        required
                      />
                      <InputField
                        name={`extraArtists.${index}.pronouns`}
                        type="text"
                        label="Pronouns"
                      />
                      <TextareaField
                        name={`extraArtists.${index}.bio`}
                        rows={4}
                        label="Bio"
                      />
                      <ImageUploadField
                        label="Image"
                        required
                        name={`extraArtists.${index}.image`}
                      />
                    </div>
                  ))}
                <button
                  className="underline"
                  onClick={() => arrayHelpers.push("")}
                  type="button"
                >
                  Add another artist/guest
                </button>
              </div>
            )}
          />
        </fieldset>
      )}
    </div>
  );
}
