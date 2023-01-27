import { useState } from "react";
import { Arrow } from "../icons/arrow";
import SingleLineField from "./form/singleLineField";
import DateField from "./form/dateField";
import TextareaField from "./form/textareaField";
import MultiSelectField from "./form/multiSelectField";
import ImageUploadField from "./form/imageUploadField";
import ExtraArtists from "./form/extraArtists";

export default function ShowSubmissionForm({ genres, artists, uploadLink }) {
  const [selectedShowType, setSelectedShowType] = useState<string>();
  const [additionalEq, setAdditionalEq] = useState<string>();
  const [mp3, setMp3] = useState<boolean>(false);
  const [oneHr, setOneHr] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<boolean>(false);
  const [extraArtists, setExtraArtists] =
    useState<Array<{ name: string; bio: string }>>();
  const [selectedGenres, setSelectedGenres] = useState<any>([]);
  const [selectedArtists, setSelectedArtists] = useState<any>([]);
  const [formStatus, setFormStatus] = useState<String>("inProgress");

  const showTypeChoices = [
    {
      value: "live",
      label: "Live",
    },
    {
      value: "pre-record",
      label: "Pre-record",
    },
  ];

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

  const handleSubmit = async (event) => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault();
    // setFormStatus('submitting')
    // Get data from the form.
    const data = {
      showName: event.target.showName.value,
      showDate: event.target.showDate.value,
      showDescription: event.target.showDescription.value,
      genres: selectedGenres,
      artists: selectedArtists,
      extraArtists: extraArtists,
      // coverImage: event.target.image.value,
    };

    console.log(data);

    // Send the data to the server in JSON format.
    const JSONdata = JSON.stringify(data);

    // API endpoint where we send form data.
    const endpoint = "/api/show-submission";

    // Form the request for sending data to the server.
    const options = {
      // The method is POST because we are sending data.
      method: "POST",
      // Tell the server we're sending JSON.
      headers: {
        "Content-Type": "application/json",
      },
      // Body of the request is the JSON data we created above.
      body: JSONdata,
    };

    // Send the form data to our forms API on Vercel and get a response.
    const response = await fetch(endpoint, options);

    // Get the response data from server as JSON.
    // If server returns the name submitted, that means the form works.
    const result = await response.json();

    if (result.status === 200) {
      setFormStatus("submitted");
    } else {
      alert(`error`);
    }
  };

  return (
    // We pass the event to the handleSubmit() function on submit.
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>
          <h2 className="font-sans text-base sm:text-large">Personal info</h2>
        </legend>
        <SingleLineField
          label="Email address"
          name="email"
          required={true}
          type="email"
        />
        <SingleLineField label="Contact number" name="number" type="number" />
        {/* <SingleLineField label="Contact phone number" name="number" type="number" /> */}
      </fieldset>

      <fieldset>
        <legend>
          <h2 className="font-sans text-base sm:text-large">Show info</h2>
        </legend>
        <SingleLineField
          label="Name"
          name="showName"
          required={true}
          type="text"
        />
        <DateField label="Date" name="showDate" required={true} />
        <MultiSelectField
          label="Genres"
          description="Up to 3"
          name="genres"
          required={true}
          options={genres}
          setOptions={setGenresFromChild}
          limit={3}
        />
        <TextareaField
          label="Description"
          name="showDescription"
          required={true}
          rows={4}
        />
        <SingleLineField
          label="Instagram @ handle(s)"
          description="For you and your guest(s)"
          name="instagram"
          required={true}
          type="text"
        />
        <ImageUploadField label="Show image" name="showImage" />

        <fieldset className="mt-8 mb-8">
          <legend>Is your show...*</legend>
          <div>
            <input
              type="radio"
              id="live"
              name="showType"
              value="live"
              checked={selectedShowType === "live"}
              onChange={() => setSelectedShowType("live")}
              className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
            />
            <label htmlFor="live" className="checkbox-label">
              Live
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="preRecord"
              name="showType"
              value="preRecord"
              checked={selectedShowType === "preRecord"}
              onChange={() => setSelectedShowType("preRecord")}
              className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
            />
            <label htmlFor="live" className="checkbox-label">
              Pre-record
            </label>
          </div>
        </fieldset>

        {selectedShowType === "preRecord" && (
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

        {selectedShowType === "preRecord" && mp3 && oneHr && micLevel && (
          <p>
            Please upload your show{" "}
            <a href={uploadLink} rel="noreferrer" target="_blank">
              here
            </a>
          </p>
        )}

        {selectedShowType === "live" && (
          <div>
            <fieldset className="mt-8 mb-8">
              <legend>
                Are you bringing additional DJ or live-performance equipment
                (including laptop or controllers)?
              </legend>
              <div>
                <input
                  type="radio"
                  id="additionalEqYes"
                  name="showAdditional"
                  value="yes"
                  checked={additionalEq === "yes"}
                  onChange={() => setAdditionalEq("yes")}
                  className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                />
                <label htmlFor="additionalEqYes" className="checkbox-label">
                  Yes
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="additionalEqNo"
                  name="showAdditional"
                  value="no"
                  checked={additionalEq === "no"}
                  onChange={() => setAdditionalEq("no")}
                  className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                />
                <label htmlFor="additionalEqNo" className="checkbox-label">
                  No
                </label>
              </div>
            </fieldset>
          </div>
        )}

        {selectedShowType === "live" && additionalEq === "yes" && (
          <SingleLineField
            label="Please state what equipment you'll be bringing"
            name="additionalEq"
            type="text"
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
          setOptions={setArtistsFromChild}
        />
        <ExtraArtists setExtraArtistsParent={setExtraArtistsFromChild} />
      </fieldset>

      {/* {formStatus === "inProgress" && ( */}
      <button
        type="submit"
        className="inline-flex items-center space-x-4 text-base font-medium mt-6"
      >
        <span className="underline">Submit</span>
        <Arrow />
      </button>
      {/* )} */}

      {/* {formStatus === "submitting" && (
        <button disabled
          type="submit"
          className="inline-flex items-center space-x-4 text-base font-medium mt-6"
        >
          <span className="underline">Submitting</span>
        </button>
      )} */}

      {formStatus === "submitted" && (
        <p className="inline-flex items-center space-x-4 text-base font-medium mt-6">
          <span className="underline">
            Thanks for submitting your show. We will be in touch soon.
          </span>
        </p>
      )}
    </form>
  );
}
