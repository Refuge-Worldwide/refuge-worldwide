import { useState } from "react";
import { Arrow } from "../icons/arrow";
import Pill from "./pill";
import SingleLineField from "./form/singleLineField";
import DateField from "./form/dateField";
import TextareaField from "./form/textareaField";
import MultiSelectField from "./form/multiSelectField";
// import ImageUploadField from "./form/imageUploadField";

export default function ShowSubmissionForm({ genres, residents }) {
  const [selectedShowType, setSelectedShowType] = useState<string>();
  const [additionalEq, setAdditionalEq] = useState<string>();
  const [mp3, setMp3] = useState<boolean>(false);
  const [oneHr, setOneHr] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<boolean>(false);
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

  const handleSubmit = async (event) => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault();

    // Get data from the form.
    const data = {
      showName: event.target.showName.value,
      showDate: event.target.showDate.value,
      showDescription: event.target.showDescription.value,
      genres: event.target.genres.value,
      artists: event.target.artists.value,
      coverImage: event.target.image.value,
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
    alert(`: ${result.data}`);
  };

  return (
    // We pass the event to the handleSubmit() function on submit.
    <form onSubmit={handleSubmit}>
      <fieldset>
        <Pill>
          <legend>Personal info</legend>
        </Pill>
        <SingleLineField
          label="Email address"
          name="email"
          required={true}
          type="email"
        />
        {/* <SingleLineField label="Contact phone number" name="number" type="number" /> */}
      </fieldset>

      <fieldset>
        <Pill>
          <legend>Show info</legend>
        </Pill>
        <SingleLineField
          label="Name"
          name="showName"
          required={true}
          type="text"
        />
        <DateField label="Date" name="showDate" required={true} />
        <MultiSelectField
          label="Genres"
          name="genres"
          required={true}
          options={genres}
          limit={3}
        />
        <TextareaField
          label="Description"
          name="showDescription"
          required={true}
          rows={4}
        />
        <MultiSelectField
          label="Artist(s)"
          name="artists"
          required={true}
          options={residents}
          limit={5}
        />
        {/* <SingleLineField label="Instagram @ handle(s)" name="instagram" required={true} type="text" /> */}
        <label htmlFor="image">Show / Host image</label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/png, image/jpeg"
        ></input>

        <fieldset className="mt-6">
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
            <label htmlFor="live" className="sm:mt-0.5 sm:leading-none">
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
            <label htmlFor="live" className="sm:mt-0.5 sm:leading-none">
              Pre-record
            </label>
          </div>
        </fieldset>

        {selectedShowType === "preRecord" && (
          <fieldset>
            <legend>Please check before sending</legend>
            <div>
              <input
                type="checkbox"
                id="mp3"
                name="mp3"
                onChange={(e) => setMp3(e.target.checked)}
                className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
              />
              <label htmlFor="live" className="sm:mt-0.5 sm:leading-none">
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
              <label htmlFor="live" className="sm:mt-0.5 sm:leading-none">
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
              <label htmlFor="live" className="sm:mt-0.5 sm:leading-none">
                Mic levels checked
              </label>
            </div>
          </fieldset>
        )}

        {selectedShowType === "preRecord" && mp3 && oneHr && micLevel && (
          <p>Please upload your show to the drive here</p>
        )}

        {selectedShowType === "live" && (
          <div>
            <fieldset className="mt-6">
              <legend>
                Are you bringing additional DJ or live-performance equipment
                (including laptop or controllers)?
              </legend>
              <div>
                <input
                  type="radio"
                  id="yes"
                  name="showAdditional"
                  value="yes"
                  checked={additionalEq === "yes"}
                  onChange={() => setAdditionalEq("yes")}
                  className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                />
                <label htmlFor="live" className="sm:mt-0.5 sm:leading-none">
                  Yes
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="no"
                  name="showAdditional"
                  value="no"
                  checked={additionalEq === "no"}
                  onChange={() => setAdditionalEq("no")}
                  className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
                />
                <label htmlFor="live" className="sm:mt-0.5 sm:leading-none">
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

      <button
        type="submit"
        className="inline-flex items-center space-x-4 text-base font-medium mt-6"
      >
        <span className="underline">Submit</span>
        <Arrow />
      </button>
    </form>
  );
}
