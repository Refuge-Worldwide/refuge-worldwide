import { useState } from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Prose from "../components/Prose";

export default function ShowSubmissionInfo({
  onReadInfo,
  liveShows,
  liveShows2,
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
      <div className={`${readInfo && !infoOpen ? "hidden" : ""}`}>
        <h2 className="font-sans">Important info</h2>
        <span className="block text-center">Please read</span>
        <h3 className="font-sans w-fit">Live Shows</h3>
        <div className="border-black border p-8 bg-orange mb-6">
          <Prose>{documentToReactComponents(liveShows?.json)}</Prose>
        </div>
        <div className="border-black border p-8 bg-green">
          <Prose>{documentToReactComponents(liveShows2?.json)}</Prose>
        </div>

        <h3 className="font-sans w-fit">Pre-Recorded Shows</h3>
        <div className="border-black border p-8 bg-blue">
          <Prose>{documentToReactComponents(preRecords?.json)}</Prose>
        </div>
      </div>

      <div className="space-x-3 text-small mt-8">
        {readInfo && !infoOpen && (
          <button onClick={() => setInfoOpen(!infoOpen)}>Open info +</button>
        )}
        {readInfo && infoOpen && (
          <button onClick={() => setInfoOpen(!infoOpen)}>Close info -</button>
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
