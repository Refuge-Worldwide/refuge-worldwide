import { useState } from "react";
// import SingleLineField from "./singleLineField";
// import TextareaField from "./textareaField";

export default function ExtraArtists() {
  const [artistExists, setArtistExists] = useState<boolean>(true);
  const [extraArtists, setExtraArtists] = useState([{ name: "", bio: "" }]);

  const handleFormChange = (event, index) => {
    let data = [...extraArtists];
    data[index][event.target.name] = event.target.value;
    setExtraArtists(data);
  };

  const addArtistFields = () => {
    let object = {
      name: "",
      bio: "",
    };

    setExtraArtists([...extraArtists, object]);
  };

  const removeArtistFields = (index) => {
    let data = [...extraArtists];
    data.splice(index, 1);
    setExtraArtists(data);
  };

  return (
    <div>
      <div>
        <input
          type="checkbox"
          id="artistExists"
          name="artistExists"
          onChange={(e) => setArtistExists(!e.target.checked)}
          className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
        />
        <label htmlFor="artistExists" className="checkbox-label">
          Can&apos;t find artist/guest in the dropdown
        </label>
      </div>

      {!artistExists && (
        <fieldset>
          <legend>Artist/guest info</legend>
          {extraArtists.map((form, index) => {
            return (
              <div key={index}>
                <div className="mb-6">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="pill-input"
                    onChange={(event) => handleFormChange(event, index)}
                    value={form.name}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    rows={2}
                    name="bio"
                    className="pill-input"
                    onChange={(event) => handleFormChange(event, index)}
                    value={form.bio}
                    required
                  />
                </div>
                <button onClick={() => removeArtistFields(index)}>
                  Remove
                </button>
              </div>
            );
          })}
          <button onClick={addArtistFields}>Add More..</button>

          {/* <SingleLineField
            label="Instagram @ handle(s)"
            name="instagram"
            required={true}
            type="text"
          /> */}
        </fieldset>
      )}
    </div>
  );
}
