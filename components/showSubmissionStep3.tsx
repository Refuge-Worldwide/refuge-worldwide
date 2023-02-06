import { useState } from "react";
import MultiSelectField from "./form/multiSelectField";
import ImageUploadField from "./form/imageUploadField";
import { Field, FieldArray, ErrorMessage } from "formik";
import { Close } from "../icons/menu";

export default function ShowSubmissionStep3({
  genres,
  artists,
  uploadLink,
  values,
  showType,
}) {
  const [mp3, setMp3] = useState<boolean>(false);
  const [oneHr, setOneHr] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<boolean>(false);
  const [extraArtists, setExtraArtists] =
    useState<Array<{ name: string; bio: string }>>();
  const [showExtraArtists, setShowExtraArtists] = useState<boolean>(false);

  const [selectedGenres, setSelectedGenres] = useState<any>([]);
  const [selectedArtists, setSelectedArtists] = useState<any>([]);

  const setExtraArtistsFromChild = (childData) => {
    setExtraArtists(childData);
  };

  const setGenresFromChild = (childData) => {
    setSelectedGenres(childData);
    console.log(childData);
  };

  const setArtistsFromChild = (childData) => {
    setSelectedArtists(childData);
  };

  return (
    // We pass the event to the handleSubmit() function on submit.
    <div>
      <fieldset>
        <legend>
          <h2 className="font-sans text-base sm:text-large">Personal info</h2>
        </legend>
        <div className="mb-10">
          <label htmlFor="email">Email address*</label>
          <Field
            type="email"
            id="email"
            name="email"
            className="pill-input"
            required
          />
          <ErrorMessage
            className="text-red mt-2"
            component="span"
            name="email"
          />
        </div>

        <div className="mb-10">
          <label htmlFor="number">Contact number</label>
          <Field
            type="number"
            id="contact"
            name="contact"
            className="pill-input"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <h2 className="font-sans text-base sm:text-large">Show info</h2>
        </legend>
        <div className="mb-10">
          <label htmlFor="name">Name*</label>
          <Field
            type="text"
            id="name"
            name="name"
            className="pill-input"
            required
          />
          <ErrorMessage
            className="text-red mt-2"
            component="span"
            name="name"
          />
        </div>
        <div className="mb-10">
          <label htmlFor="date">Date*</label>
          <Field
            type="date"
            id="date"
            name="date"
            className="pill-input"
            required
          />
          <ErrorMessage
            className="text-red mt-2"
            component="span"
            name="date"
          />
        </div>
        <MultiSelectField
          label="Genres"
          description="Up to 3"
          name="genres"
          required={true}
          options={genres}
          setOptions={setGenresFromChild}
          limit={3}
        />
        <div className="mb-10">
          <label htmlFor="description">Description*</label>
          <Field
            component="textarea"
            rows={4}
            id="description"
            name="description"
            className="pill-input"
            required
          />
          <ErrorMessage
            className="text-red mt-2"
            component="span"
            name="description"
          />
        </div>
        <div className="mb-10">
          <label htmlFor="date">
            Instagram @ handle(s)
            <span className="label-description">For you and your guest(s)</span>
          </label>
          <Field
            type="text"
            id="instagram"
            name="instagram"
            className="pill-input"
          />
        </div>
        <ImageUploadField label="Show image" name="showImage" />

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
          <div>
            <fieldset className="mt-8 mb-8">
              <legend>
                Are you bringing additional DJ or live-performance equipment
                (including laptop or controllers)?
              </legend>
              <div>
                <Field
                  type="radio"
                  id="additionalEqYes"
                  name="additionalEq"
                  value="yes"
                  className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                />
                <label htmlFor="additionalEqYes" className="checkbox-label">
                  Yes
                </label>
              </div>
              <div>
                <Field
                  type="radio"
                  id="additionalEqNo"
                  name="additionalEq"
                  value="no"
                  className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                />
                <label htmlFor="additionalEqNo" className="checkbox-label">
                  No
                </label>
              </div>
            </fieldset>
          </div>
        )}

        {showType === "live" && values.additionalEq === "yes" && (
          <div className="mb-10">
            <label htmlFor="additionalEqDesc">
              Please state what equipment you&apos;ll be bringing
            </label>
            <Field
              type="text"
              id="additionalEqDesc"
              name="additionalEqDesc"
              className="pill-input"
            />
          </div>
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
          setOptions={setArtistsFromChild}
        />

        <div>
          <input
            type="checkbox"
            id="artistExists"
            name="artistExists"
            onChange={(e) => setShowExtraArtists(e.target.checked)}
            className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
          />
          <label htmlFor="artistExists" className="checkbox-label">
            Can&apos;t find artist/guest in the dropdown
          </label>
        </div>

        {showExtraArtists && (
          <fieldset className="mt-8 mb-8">
            <legend className="mb-6">Artist/guest info</legend>
            <FieldArray
              name="extraArtists"
              render={(arrayHelpers) => (
                <div>
                  {values.extraArtists &&
                    values.extraArtists.length > 0 &&
                    values.extraArtists.map((extraArtist, index) => (
                      <div
                        className="mb-8 border border-black p-8 relative"
                        key={index}
                      >
                        <button
                          className="float-right"
                          onClick={() => arrayHelpers.remove(index)}
                          type="button"
                        >
                          <Close size={24} />
                        </button>
                        <div className="mb-6 mt-6">
                          <label htmlFor="name">Name</label>
                          <Field
                            type="text"
                            name={`extraArtist.${index}.name`}
                            className="pill-input"
                            required
                          />
                        </div>
                        <div className="mb-6">
                          <label htmlFor="bio">Bio</label>
                          <Field
                            rows={4}
                            name={`extraArtist.${index}.bio`}
                            className="pill-input"
                            required
                          />
                        </div>
                        <ImageUploadField
                          label="Guest image"
                          name={`extraArtist.${index}.guestImage`}
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
