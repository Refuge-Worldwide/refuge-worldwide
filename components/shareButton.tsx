import Share from "../icons/share";
import { isServer } from "../util";

const Button;

export default function ShareButton({
  details,
}: {
  details: {
    title: string;
    slug: string;
  };
}) {
  const cachedClassNames = "w-20 h-20 sm:w-28 sm:h-28 focus:outline-none";

  const { title, slug } = details;

  const handleOnClick = async () => {
    const shareData: ShareData = {
      text: title,
      title: "Refuge Worldwide",
      url: `https://refuge-worldwide.vercel.app/${slug}`,
    };

    try {
      await navigator.share(shareData);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isServer && navigator?.share)
    return (
      <button className={cachedClassNames} onClick={handleOnClick}>
        <Share />
      </button>
    );

  return (
    <button className={cachedClassNames}>
      <Share />
    </button>
  );
}
