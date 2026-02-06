// button for revalidating artwork in the contentful admin ui.

import { useEffect, useState } from "react";
import * as contentful from "contentful-ui-extensions-sdk";

const ContentfulRevalidateArtwork = () => {
  const [sdk, setSdk] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Initialize Contentful SDK on component mount
    contentful.init((sdkInstance) => {
      setSdk(sdkInstance);
    });
  }, []);

  const fetchEntryData = () => {
    if (!sdk) return null;

    // Get entry fields and set them as state
    const fields = sdk.entry.fields;

    // Try to get additionalMediaImages, fallback to legacy additionalImages
    let additionalImages = null;
    try {
      additionalImages = sdk.entry.fields.additionalMediaImages?.getValue();
    } catch (e) {
      // Field might not exist, try legacy field
      try {
        additionalImages = sdk.entry.fields.additionalImages?.getValue();
      } catch (err) {
        // Neither field exists, leave as null
      }
    }

    const data = {
      id: sdk.entry.getSys().id,
      title: sdk.entry.fields.title.getValue(),
      coverImage: sdk.entry.fields.coverImage.getValue(),
      additionalMediaImages: additionalImages,
      artists: sdk.entry.fields.artists.getValue(),
      date: sdk.entry.fields.date.getValue(),
      dateEnd: sdk.entry.fields.dateEnd.getValue(),
    };
    return data;
  };

  const handleButtonClick = async () => {
    const data = fetchEntryData();
    if (!data) {
      setMessage("Entry data is not available yet.");
      return;
    }

    setMessage("Regenerating artwork...");

    try {
      // Define request
      const req = {
        method: "POST",
        url: `${window.location.origin}/api/revalidate/show-artwork?regenerate=true`,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };

      // Get and apply the signed headers
      const { additionalHeaders } = await sdk.cma.appSignedRequest.create(
        {
          appDefinitionId: sdk.ids.app,
        },
        {
          method: req.method,
          headers: req.headers,
          body: req.body,
          path: new URL(req.url).pathname,
        }
      );
      Object.assign(req.headers, additionalHeaders);

      const response = await fetch(req.url, req);

      if (response.ok) {
        setMessage("Artwork successfully regenerated!");
      } else {
        const errorData = await response.json();
        setMessage(
          `Failed to regenerate: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error generating artwork:", error.message);
      setMessage("An error occurred while regenerating artwork.");
    }
  };

  if (!sdk) {
    return <div>Loading Contentful SDK...</div>;
  }

  return (
    <div className="w-full" style={{ fontFamily: "Arial, sans-serif" }}>
      <button
        className="text-white bg-blue px-5 py-3 rounded w-full font-bold"
        style={{ fontSize: "15px" }}
        onClick={handleButtonClick}
      >
        Regenerate Artwork {process.env.API_SECRET}
      </button>
      <div style={{ marginTop: "10px", fontSize: "14px", color: "gray" }}>
        {message}
      </div>
    </div>
  );
};

ContentfulRevalidateArtwork.noLayout = true;

export default ContentfulRevalidateArtwork;
