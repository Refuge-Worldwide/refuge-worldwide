import { useState } from "react";
import MultiSelectField from "./formFields/multiSelectField";
import ImageUploadField from "./formFields/imageUploadField";
import { useFormikContext, Field, FieldArray, ErrorMessage } from "formik";
import { Close } from "../icons/menu";
import InputField from "./formFields/inputField";
import TextareaField from "./formFields/textareaField";
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
        <InputField name="number" type="number" label="Contact number" />

        {/* <div className="mb-10">
          <label htmlFor="number">Contact number</label>
          <Field
            type="number"
            id="contact"
            name="contact"
            className="pill-input"
          />
        </div> */}
      </fieldset>

      <fieldset>
        <legend>
          <h2 className="font-sans text-base sm:text-large">Show info</h2>
        </legend>
        <InputField name="name" type="text" label="Show name" required={true} />
        <InputField
          name="datetime"
          type="datetime-local"
          label="Date / time"
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
          <div className="flex space-x-3 text-base mt-12 mb-6">
            <Field
              type="checkbox"
              id="additionalEq"
              name="additionalEq"
              className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black self-center"
            />
            <label
              htmlFor="additionalEq"
              className="sm:mt-0.5 text-small sm:text-base sm:leading-none"
            >
              Are you bringing additional DJ or live-performance equipment
              (including laptop or controllers)?
            </label>
          </div>
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
          <h2 className="font-sans text-base sm:text-large">
            Artist/guest info
          </h2>
        </legend>
        <MultiSelectField
          label="Artist(s)"
          name="artists"
          required={true}
          options={artists}
          limit={5}
        />

        <div>
          <Field
            type="checkbox"
            id="hasExtraArtists"
            name="hasExtraArtists"
            className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
          />
          <label htmlFor="hasExtraArtists" className="checkbox-label">
            Can&apos;t find artist/guest in the dropdown
          </label>
        </div>

        {values.hasExtraArtists && (
          <fieldset className="mt-8 mb-8">
            <legend className="mb-6">Artist/guest info</legend>
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

                        <div className="mb-6 mt-6">
                          <label htmlFor="name">Name</label>
                          <Field
                            type="text"
                            name={`extraArtists[${index}].name`}
                            className="pill-input"
                            required
                          />
                          <ErrorMessage
                            className="text-red mt-2"
                            component="span"
                            name={`extraArtists[${index}].name`}
                          />
                        </div>
                        <div className="mb-6">
                          <label htmlFor="bio">Bio</label>
                          <Field
                            component="textarea"
                            rows={4}
                            name={`extraArtists[${index}].bio`}
                            className="pill-input"
                            required
                          />
                          <ErrorMessage
                            className="text-red mt-2"
                            component="span"
                            name={`extraArtists[${index}].bio`}
                          />
                        </div>
                        <ImageUploadField
                          label="Guest image"
                          name={`extraArtists[${index}].guestImage`}
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
      </fieldset>
    </div>
  );
}
