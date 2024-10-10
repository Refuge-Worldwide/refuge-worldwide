import { useEffect, useState } from "react";
import { NextPage } from "next";

const ScheduleArtworkPage: NextPage & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
} = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const fetchImage = async () => {
    const response = await fetch("/api/schedule-artwork");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
  };

  useEffect(() => {
    fetchImage();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "black",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {imageUrl ? (
        <img
          className="border border-white"
          src={imageUrl}
          alt="Schedule Artwork"
          style={{ maxWidth: "100%", maxHeight: "80vh" }}
        />
      ) : (
        <p>Loading...</p>
      )}
      <button
        className="bg-white border-white p-4 border mt-4 rounded"
        onClick={fetchImage}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Regenerate Artwork
      </button>
    </div>
  );
};

// Custom layout function to avoid using the default layout
ScheduleArtworkPage.getLayout = (page: React.ReactNode) => page;

export default ScheduleArtworkPage;
