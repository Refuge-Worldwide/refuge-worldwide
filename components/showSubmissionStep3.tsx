import { useState } from "react";
import MultiSelectField from "./formFields/multiSelectField";
import ImageUploadField from "./formFields/imageUploadField";
import { useFormikContext, Field, FieldArray, ErrorMessage } from "formik";
import { Close } from "../icons/menu";
import InputField from "./formFields/inputField";
import TextareaField from "./formFields/textareaField";
import CheckboxField from "./formFields/checkboxField";
import { SubmissionFormValues } from "../types/shared";

export default function ShowSubmissionStep3({
  genres,
  artists,
  uploadLink,
  showType,
}) {
  const [mp3, setMp3] = useState<boolean>(false);
  const [oneHr, setOneHr] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<boolean>(false);
  const { values } = useFormikContext<SubmissionFormValues>();

  return (
    // We pass the event to the handleSubmit() function on submit.
    <div>
      {/* <pre className="text-white">{JSON.stringify(values, null, 2)}</pre> */}
      <fieldset>
        <legend>
          <h2 className="font-sans text-base sm:text-large">Personal info</h2>
        </legend>
        <InputField
          name="email"
          type="email"
          label="Email address"
          required={true}
        />
        {showType === "live" && (
          <InputField name="number" type="tel" label="Contact number" />
        )}
      </fieldset>

      <fieldset>
        <legend>
          <h2 className="font-sans text-base sm:text-large">Show info</h2>
        </legend>
        <InputField name="name" type="text" label="Show name" required={true} />
        <InputField
          name="datetime"
          type="datetime-local"
          label="Date / time (CET)"
          required={true}
        />
        <fieldset className="mb-10">
          <legend>Length</legend>
          <div className="flex">
            <div className="w-1/2">
              <Field
                type="radio"
                id="1hr"
                name="length"
                value="1"
                className="peer hidden"
              />
              <label
                htmlFor="1hr"
                className="block cursor-pointer select-none pill-input rounded-tr-none rounded-br-none py-3 text-center peer-checked:bg-black peer-checked:text-white peer-checked:font-bold"
              >
                1hr
              </label>
            </div>
            <div className="w-1/2">
              <Field
                type="radio"
                id="2hr"
                name="length"
                value="2"
                className="peer hidden"
              />
              <label
                htmlFor="2hr"
                className="block cursor-pointer select-none pill-input rounded-tl-none rounded-bl-none py-3 text-center peer-checked:bg-black peer-checked:text-white peer-checked:font-bold"
              >
                2hrs
              </label>
            </div>
          </div>
          <ErrorMessage className="text-red" component="span" name="length" />
        </fieldset>
        <MultiSelectField
          label="Genres"
          description="Up to 3. If you can't find a genre on this list please get in touch."
          name="genres"
          required={true}
          options={genres}
          limit={3}
        />
        <CheckboxField
          name="hasNewGenres"
          label="Genre not listed?"
          size="small"
        />
        {values.hasNewGenres && (
          <InputField
            name="newGenres"
            type="text"
            label="Please add additional genres here"
          />
        )}
        <TextareaField
          name="description"
          rows={4}
          label="Show description"
          required={true}
        />
        <InputField
          name="instagram"
          type="text"
          label="Instagram @ handle(s)"
          description="For you and your guest(s). A comma seperated list NOT including the @ symbol."
        />
        <ImageUploadField label="Show image" name="image" required={true} />

        {showType === "preRecord" && (
          <fieldset>
            <legend>
              Pre-recorded shows
              <span className="label-description">
                Please check your all the options below before uploading
              </span>
            </legend>
            <div>
              <input
                type="checkbox"
                id="mp3"
                name="mp3"
                onChange={(e) => setMp3(e.target.checked)}
                className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
              />
              <label htmlFor="live" className="checkbox-label">
                File is in mp3 format
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="oneHr"
                name="oneHr"
                onChange={(e) => setOneHr(e.target.checked)}
                className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
              />
              <label htmlFor="live" className="checkbox-label">
                Show length is not shorter than 1hr / 60mins (or 120mins for 2hr
                slots)
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="micLevel"
                name="micLevel"
                onChange={(e) => setMicLevel(e.target.checked)}
                className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
              />
              <label htmlFor="live" className="checkbox-label">
                Mic levels checked
              </label>
            </div>
          </fieldset>
        )}

        {showType === "preRecord" && mp3 && oneHr && micLevel && (
          <p>
            Please upload your show{" "}
            <a href={uploadLink} rel="noreferrer" target="_blank">
              here
            </a>
          </p>
        )}

        {showType === "live" && (
          <CheckboxField
            name="additionalEq"
            label="Are you bringing additional DJ or live-performance equipment (including laptop or controllers)?"
          />
        )}

        {showType === "live" && values.additionalEq && (
          <InputField
            name="additionalEqDesc"
            type="text"
            label="Please state what equipment you'll be bringing"
            required={true}
          />
        )}
      </fieldset>

      <fieldset>
        <legend>
          <h2 className="font-sans text-base sm:text-large">Host/guest info</h2>
        </legend>
        <MultiSelectField
          label="Host(s)"
          name="hosts"
          required={true}
          options={artists}
          limit={5}
        />

        <CheckboxField
          name="isNewHost"
          label="Are you a new host / Can't find your artist name in the dropdown?"
          size="small"
        />

        {values.isNewHost && (
          <fieldset>
            <legend className="mb-6">New host info</legend>
            <div className="border border-black p-8 mb-10">
              <InputField
                name="newHost.name"
                type="text"
                label="Name"
                required={true}
              />
              <TextareaField
                name="newHost.bio"
                rows={4}
                label="Bio"
                required={true}
              />
              <ImageUploadField
                label="Host image"
                name="newHost.image"
                required={true}
              />
            </div>
          </fieldset>
        )}

        <CheckboxField
          name="hasGuests"
          label="Do you have guests on your show?"
        />
      </fieldset>

      {values.hasGuests && (
        <fieldset>
          <legend>
            <h2 className="sr-only">Guest info</h2>
          </legend>

          <div>
            {/* <MultiSelectField
              label="Guest(s)"
              name="guests"
              options={artists}
              limit={5}
            />

            <CheckboxField
              name="hasNewGuests"
              label="Can't find your guests names in the dropdown?"
              size="small"
            /> */}

            <fieldset className=" mb-8">
              <legend className="mb-6">
                Guest(s) info
                <span className="label-description">
                  Please put guest bios in the show description
                </span>
              </legend>
              <FieldArray
                name="guests"
                render={(arrayHelpers) => (
                  <div>
                    {values.guests &&
                      values.guests.map((guest, index) => (
                        <div
                          className="mb-8 border border-black p-8 relative"
                          key={"guest" + index}
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

                          <div className="mb-6 mt-6">
                            <label htmlFor="name">Name*</label>
                            <Field
                              type="text"
                              name={`guests.${index}.name`}
                              className="pill-input"
                              required
                            />
                            <ErrorMessage
                              className="text-red mt-2 text-small"
                              component="span"
                              name={`guests.${index}.name`}
                            />
                          </div>
                          <ImageUploadField
                            label="Guest image"
                            name={`guests.${index}.image`}
                          />
                        </div>
                      ))}
                    <button
                      className="underline"
                      onClick={() => arrayHelpers.push("")}
                      type="button"
                    >
                      Add another guest
                    </button>
                  </div>
                )}
              />
            </fieldset>
          </div>
        </fieldset>
      )}
    </div>
  );
}
