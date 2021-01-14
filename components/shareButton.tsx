import Share from "../icons/share";
import { isServer } from "../util";

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

  const URL = `https://refuge-worldwide.vercel.app${slug}`;

  const TEXT =
    "Refuge Worldwide is a community radio station and fundraising platform based in Berlin.";

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

  if (!isServer && navigator?.share)
    return (
      <button className={cachedClassNames} onClick={handleOnClick}>
        <Share />
      </button>
    );

  return (
    <a className={cachedClassNames}>
      <Share />
    </a>
  );
}

const WhatsApp = ({ link, text }) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    href={`https://wa.me/?text=${encodeURI(`${text} ${link}`)}`}
  >
    WhatsApp
  </a>
);

const Facebook = ({ link }) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURI(link)}`}
  >
    Facebook
  </a>
);

const Twitter = ({ link, text }) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    href={`https://twitter.com/intent/tweet?text=${encodeURI(
      text
    )}&url=${encodeURI(link)}&via=refugeworldwide`}
  >
    Twitter
  </a>
);

const Telegram = ({ link, text }) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    href={`https://telegram.me/share/url?url=${encodeURI(
      link
    )}&text=${encodeURI(text)}`}
  >
    Telegram
  </a>
);
