import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Prose from "./Prose";
import { Field, ErrorMessage } from "formik";

export default function ShowSubmissionStep2({ importantInfo, showType }) {
  const importantInfoToShow = () => {
    if (showType == "live") {
      return (
        <div>
          <div className="border-black border p-8 bg-orange mb-6">
            <Prose>
              {documentToReactComponents(importantInfo.liveShows?.json)}
            </Prose>
          </div>
          <div className="border-black border p-8 bg-green">
            <Prose>
              {documentToReactComponents(importantInfo.liveShows2?.json)}
            </Prose>
          </div>
        </div>
      );
    } else {
      return (
        <div className="border-black border p-8 bg-blue">
          <Prose>
            {documentToReactComponents(importantInfo.preRecords?.json)}
          </Prose>
        </div>
      );
    }
  };

  return (
    // We pass the event to the handleSubmit() function on submit.
    <div className="mt-16">
      <legend className="font-sans mb-2 text-large font-medium text-center">
        Important info
      </legend>

      <span className="block text-center mb-12">Please read</span>
      {importantInfoToShow()}
      <div className="space-x-3 text-base mt-12 mb-2">
        <Field
          type="checkbox"
          id="readInfo"
          name="readInfo"
          className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
        />
        <label htmlFor="readInfo" className="sm:mt-0.5 sm:leading-none">
          I confirm I have read the information above
        </label>
      </div>
      <ErrorMessage className="text-red" component="span" name="readInfo" />
    </div>
  );
}
