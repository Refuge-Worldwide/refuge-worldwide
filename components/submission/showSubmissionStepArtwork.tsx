import { useFormikContext, Field, ErrorMessage } from "formik";
import { useState, useEffect } from "react";
import { socialImageURL } from "../../util";
import { SubmissionFormValues } from "../../types/shared";

export default function ShowSubmissionStepArtwork() {
  const { values } = useFormikContext<SubmissionFormValues>();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchImage = async () => {
    setLoading(true);
    const surl = socialImageURL(values, true);
    console.log(surl);
    const response = await fetch(surl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
    setLoading(false);
  };

  useEffect(() => {
    fetchImage();
  }, []);

  return (
    // We pass the event to the handleSubmit() function on submit.
    <div className="mt-16">
      <legend className="font-sans mb-12 text-large font-medium text-center">
        Show artwork
      </legend>
      <div className="aspect-square max-w-3xl bg-black text-white flex items-center justify-center h-full w-full mx-auto">
        {imageUrl ? (
          <div
            className="border border-white bg-cover bg-center"
            style={{
              backgroundImage: `url(${imageUrl})`,
              width: "100%",
              height: "100%",
              maxHeight: "80vh",
            }}
          ></div>
        ) : (
          <span className="animate-pulse">Generating artwork...</span>
        )}
      </div>
      <div className="space-x-3 text-base mt-12 mb-2">
        <Field
          type="checkbox"
          id="artwork"
          name="artwork"
          className="h-6 w-6 rounded-full border-2 border-black text-black focus:ring-black"
        />
        <label
          htmlFor="artwork"
          className="sm:mt-0.5 text-small sm:text-base sm:leading-none"
        >
          I confirm I am happy with the show artwork above
        </label>
      </div>
      <ErrorMessage className="text-red" component="span" name="artwork" />
    </div>
  );
}
