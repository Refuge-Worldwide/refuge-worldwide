import { useFormikContext, Field, ErrorMessage } from "formik";
import { useState, useEffect } from "react";
import { showArtworkURL } from "../../util";
import { SubmissionFormValues } from "../../types/shared";

export default function ShowSubmissionStepArtwork() {
  const { values } = useFormikContext<SubmissionFormValues>();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchImage = async () => {
    setLoading(true);
    const surl = showArtworkURL(values, true);
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
          <>
            <div
              className="border border-white bg-cover bg-center"
              style={{
                backgroundImage: `url(${imageUrl})`,
                width: "100%",
                height: "100%",
                maxHeight: "80vh",
              }}
            ></div>
          </>
        ) : (
          <span className="animate-pulse">Generating artwork...</span>
        )}
      </div>
      {imageUrl && (
        <p>
          Please press ‘submit’ if you’re happy with the artwork. If you need to
          make changes please go back.
        </p>
      )}
    </div>
  );
}
