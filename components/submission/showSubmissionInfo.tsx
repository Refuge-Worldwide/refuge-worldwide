import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Prose from "../Prose";

export default function ShowSubmissionInfo({
  liveShows,
  liveShows2,
  preRecords,
}) {
  return (
    // We pass the event to the handleSubmit() function on submit.
    <div>
      <h2 className="font-sans w-fit">Live Shows</h2>
      <div className="border-black border p-8 bg-orange mb-6">
        <Prose>{documentToReactComponents(liveShows?.json)}</Prose>
      </div>
      <div className="border-black border p-8 bg-green">
        <Prose>{documentToReactComponents(liveShows2?.json)}</Prose>
      </div>

      <h2 className="font-sans w-fit">Pre-Recorded Shows</h2>
      <div className="border-black border p-8 bg-blue">
        <Prose>{documentToReactComponents(preRecords?.json)}</Prose>
      </div>
    </div>
  );
}
