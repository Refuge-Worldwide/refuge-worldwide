import { useState } from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Prose from "../components/Prose";

export default function ShowSubmissionInfo({
  onReadInfo,
  equipment,
  liveShows,
  preRecords,
}) {
  const [readInfo, setReadInfo] = useState<boolean>(false);
  const [infoOpen, setInfoOpen] = useState<boolean>(false);

  const onChangeReadInfo = () => {
    setReadInfo(true);
    onReadInfo(true);
  };

  return (
    // We pass the event to the handleSubmit() function on submit.
    <div>
      <div className={`${readInfo && !infoOpen ? "bg-red" : ""}`}>
        <h2>Important info</h2>
        <Prose>{documentToReactComponents(equipment?.json)}</Prose>
        <Prose>{documentToReactComponents(liveShows?.json)}</Prose>
        <Prose>{documentToReactComponents(preRecords?.json)}</Prose>
      </div>

      <div className="space-x-3 text-small mt-8">
        {readInfo && !infoOpen && (
          <button onClick={() => setInfoOpen(!infoOpen)}>Open info</button>
        )}
        {readInfo && infoOpen && (
          <button onClick={() => setInfoOpen(!infoOpen)}>Close info</button>
        )}
      </div>

      {!readInfo && (
        <div className="space-x-3 text-small mt-8">
          <input
            type="checkbox"
            id="readInfo"
            name="readInfo"
            onChange={onChangeReadInfo}
            className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
          />
          <label htmlFor="readInfo" className="sm:mt-0.5 sm:leading-none">
            I confirm I have read the information above
          </label>
        </div>
      )}
    </div>
  );
}
