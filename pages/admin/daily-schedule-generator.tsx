import { useEffect, useState } from "react";
import { NextPage } from "next";
import { TfiReload, TfiDownload } from "react-icons/tfi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import BackButton from "../../components/backButton";
const ScheduleArtworkPage: NextPage & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
} = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchImage = async () => {
    setLoading(true);
    const response = await fetch("/api/schedule-artwork");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
    setLoading(false);
  };

  const downloadImage = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "schedule-artwork.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    fetchImage();
  }, []);

  return (
    <div className="relative bg-black">
      <div className="absolute left-4 sm:left-8 top-3 sm:top-4 z-20">
        <BackButton backPath="/admin/calendar" />
      </div>
      <div className="relative min-h-screen flex flex-col items-center pt-20 md:pt-8">
        <div className="h-[75vh] flex items-center align-middle">
          {imageUrl ? (
            <img
              className="border border-white"
              src={imageUrl}
              alt="Schedule Artwork"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            <p className="text-white animate-pulse">Loading...</p>
          )}
          <div />
        </div>
        <div className="flex gap-4">
          <button
            className="bg-white border-white p-4 border mt-4 rounded text-large flex items-center gap-4"
            onClick={fetchImage}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            <span>Regenerate</span>
            {loading ? (
              <AiOutlineLoading3Quarters size={20} className="animate-spin" />
            ) : (
              <TfiReload size={20} />
            )}{" "}
          </button>
          {imageUrl && (
            <button
              className="bg-white border-white p-4 border mt-4 rounded text-large gap-4"
              onClick={downloadImage}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom layout function to avoid using the default layout
ScheduleArtworkPage.getLayout = (page: React.ReactNode) => page;

export default ScheduleArtworkPage;
