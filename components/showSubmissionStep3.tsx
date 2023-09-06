import { useState } from "react";
import MultiSelectField from "./formFields/multiSelectField";
import ImageUploadField from "./formFields/imageUploadField";
import { useFormikContext, Field, FieldArray, ErrorMessage } from "formik";
import { Close } from "../icons/menu";
import InputField from "./formFields/inputField";
import TextareaField from "./formFields/textareaField";
import CheckboxField from "./formFields/checkboxField";
import { SubmissionFormValues } from "../types/shared";
import { AiOutlineInfoCircle } from "react-icons/ai";
import * as RadioGroup from "@radix-ui/react-radio-group";

export default function ShowSubmissionStep3({
  genres,
  artists,
  uploadLink,
  showType,
}) {
  const [mp3, setMp3] = useState<boolean>(false);
  const [oneHr, setOneHr] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<boolean>(false);
  const { values, setFieldValue } = useFormikContext<SubmissionFormValues>();

  return (
    <div>
      {/* <pre className="text-white bg-black">
        {JSON.stringify(values, null, 2)}
      </pre> */}
      <fieldset className="mt-16">
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
        <MultiSelectField
          label="Artist(s)*"
          description="Please include guests, collectives and show hosts."
          name="artists"
          options={artists}
          limit={10}
        />

        <CheckboxField
          name="hasExtraArtists"
          label="Click here to add any artists/guests/collectives not found above."
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
                          description="No logos and no flyers. Minimum dimensions: 1000x1000px, maximum file size: 3MB."
                          required
                          name={`extraArtists.${index}.image`}
                        />
                        <div className="flex gap-2 md:gap-3 items-center border border-black p-3 md:p-6 bg-orange">
                          <AiOutlineInfoCircle className="w-5 sm:w-6 md:w-8 h-full" />
                          <span className="flex-1 text-small">
                            PLEASE NOTE: If you would like this image to be used
                            for your show’s social media artwork please also add
                            it to Show image(s) field towards the end of this
                            form.
                          </span>
                        </div>
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
        <InputField
          name="instagram"
          type="text"
          label="Instagram @ handle(s)"
          description="For you and your guest(s). A comma seperated list NOT including the @ symbol."
        />
        <InputField
          name="datetime"
          type={showType == "live" ? "datetime-local" : "date"}
          label={showType == "live" ? "Show date / time (CET)" : "Show date"}
          required={true}
        />
        <fieldset className="mb-10">
          <legend>Show length</legend>
          <RadioGroup.Root
            className="flex"
            name="Show length"
            defaultValue="1"
            onValueChange={(value: string) => setFieldValue("length", value)}
          >
            <RadioGroup.Item value="1" asChild>
              <label className="data-[state=checked]:bg-black data-[state=checked]:text-white block cursor-pointer pill-input rounded-tr-none rounded-br-none py-3 text-center">
                1hr
              </label>
            </RadioGroup.Item>

            <RadioGroup.Item value="2" asChild>
              <label className="data-[state=checked]:bg-black data-[state=checked]:text-white block cursor-pointer select-none pill-input rounded-tl-none rounded-bl-none py-3 text-center">
                2hr
              </label>
            </RadioGroup.Item>
          </RadioGroup.Root>
          <ErrorMessage className="text-red" component="span" name="length" />
        </fieldset>
        <InputField
          name="showName"
          type="text"
          label="Show title"
          description="WITHOUT artist names."
          required={true}
        />
        <ImageUploadField
          label="Show image(s)"
          name="image"
          description="Please upload your show / artist image(s) below, including any guest images. No logos and no flyers. Minimum dimensions: 1000x1000px, maximum file size: 3MB."
          required={true}
          multi={true}
        />
        <div className="flex gap-2 md:gap-3 items-center border border-black p-3 md:p-6 mb-10 bg-orange">
          <AiOutlineInfoCircle className="w-5 sm:w-6 md:w-8 h-full" />
          <span className="flex-1 text-small">
            PLEASE NOTE: Images submitted in this field are used for social
            media artwork and your show page on our site. If you added a new
            artist/guest/collective above, this may mean uploading the same
            image(s) here.
          </span>
        </div>
        <TextareaField
          name="description"
          rows={4}
          label="Show description"
          required={true}
        />
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

        {showType === "preRecord" && (
          <fieldset>
            <legend>
              Upload your show{" "}
              <a href={uploadLink} rel="noreferrer" target="_blank">
                here
              </a>
              *
              <span className="label-description">
                Please check all the options below before uploading.
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
    </div>
  );
}
