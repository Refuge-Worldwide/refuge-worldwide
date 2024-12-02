// button for revalidating artwork in the contentful admin ui.

import { useEffect, useState } from "react";
import * as contentful from "contentful-ui-extensions-sdk";

const ContentfulRevalidateArtwork = () => {
  const [sdk, setSdk] = useState(null);
  const [entryData, setEntryData] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Initialize Contentful SDK on component mount
    contentful.init((sdkInstance) => {
      setSdk(sdkInstance);

      // Get entry fields and set them as state
      // @ts-ignore: Ignore sdk type error for now
      const fields = sdkInstance.entry.fields;
      const data = {};
      Object.keys(fields).forEach((fieldId) => {
        data[fieldId] = fields[fieldId].getValue();
      });
      // @ts-ignore: Ignore sdk type error for now
      data.id = sdkInstance.entry.getSys().id;
      setEntryData(data);
    });
  }, []);

  const handleButtonClick = async () => {
    if (!entryData) {
      setMessage("Entry data is not available yet.");
      return;
    }

    setMessage("Sending entry data...");

    try {
      // Send entry data to the API
      const response = await fetch("/api/revalidate/show-artwork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryData),
      });

      if (response.ok) {
        setMessage("Entry data sent successfully!");
      } else {
        const errorData = await response.json();
        setMessage(
          `Failed to send data: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error sending entry data:", error);
      setMessage("An error occurred while sending the data.");
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
        Regenerate Artwork
      </button>
      <div style={{ marginTop: "10px", fontSize: "14px", color: "gray" }}>
        {message}
      </div>
    </div>
  );
};

ContentfulRevalidateArtwork.noLayout = true;

export default ContentfulRevalidateArtwork;
