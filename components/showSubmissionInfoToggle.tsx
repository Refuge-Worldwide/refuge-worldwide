import { useState } from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Prose from "./Prose";
import ShowSubmissionInfo from "./showSubmissionInfo";

export default function ShowSubmissionInfoToggle({
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
        <ShowSubmissionInfo
          liveShows={liveShows}
          liveShows2={liveShows2}
          preRecords={preRecords}
        />
      </div>

      <div className="space-x-3 text-small mt-8">
        {readInfo && !infoOpen && (
          <button
            className="border-black border p-4 w-full mb-6"
            onClick={() => setInfoOpen(!infoOpen)}
          >
            Open info
          </button>
        )}
        {readInfo && infoOpen && (
          <button
            className="border-black border p-4 w-full mb-6"
            onClick={() => setInfoOpen(!infoOpen)}
          >
            Close info
          </button>
        )}
      </div>

      {!readInfo && (
        <div className="space-x-3 text-base mt-12 mb-12">
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
