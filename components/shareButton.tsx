import ShareOutline from "../icons/shareOutline";
import { __SERVER__ } from "../util";
import ShareMenu from "./shareMenu";

export default function ShareButton({
  details,
}: {
  details: {
    title: string;
    slug: string;
  };
}) {
  const { title, slug } = details;

  const URL = `https://refugeworldwide.com${slug}`;

  const handleOnClick = async () => {
    const shareData: ShareData = {
      text: title,
      title: "Refuge Worldwide",
      url: URL,
    };

    try {
      await navigator.share(shareData);
    } catch (error) {
      console.error(error);
    }
  };

  if (!__SERVER__ && navigator.share)
    return (
      <button
        className="focus:outline-none"
        onClick={handleOnClick}
        aria-label="Share this show"
      >
        <ShareOutline className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={24} />
      </button>
    );

  return <ShareMenu url={URL} />;
}
