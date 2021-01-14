import Share from "../icons/share";

export default function ShareButton({
  details,
}: {
  details: {
    title: string;
    slug: string;
  };
}) {
  const { title, slug } = details;

  const handleOnClick = async () => {
    const shareData: ShareData = {
      text: title,
      title: "Refuge Worldwide",
      url: `https://refuge-worldwide.vercel.app/${slug}`,
    };

    try {
      /**
       * @todo Handle sharing on devices without the Share API
       */
      await navigator.share(shareData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      className="w-20 h-20 sm:w-28 sm:h-28 focus:outline-none"
      onClick={handleOnClick}
    >
      <Share />
    </button>
  );
}
