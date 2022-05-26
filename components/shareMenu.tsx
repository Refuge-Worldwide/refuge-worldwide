import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Share from "../icons/share";

export default function ShareMenu({ url }: { url: string }) {
  const TEXT =
    "Refuge Worldwide is a community radio station and fundraising platform based in Berlin.";

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className="w-20 h-20 sm:w-28 sm:h-28 focus:outline-none">
        <Share />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content className="mt-2 pt-4 pb-4 bg-black text-white focus:outline-none">
        <DropdownMenu.Item className="group focus:outline-none">
          <WhatsApp link={url} text={TEXT} />
        </DropdownMenu.Item>
        <DropdownMenu.Item className="group focus:outline-none">
          <Facebook link={url} />
        </DropdownMenu.Item>
        <DropdownMenu.Item className="group focus:outline-none">
          <Twitter link={url} text={TEXT} />
        </DropdownMenu.Item>
        <DropdownMenu.Item className="group focus:outline-none">
          <Telegram link={url} text={TEXT} />
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

const WhatsApp = ({ link, text }: { link: string; text: string }) => (
  <a
    className="block text-small font-medium py-2 px-6 hover:text-social-whatsapp group-focus:text-social-whatsapp"
    target="_blank"
    rel="noopener noreferrer"
    href={`https://wa.me/?text=${encodeURI(`${text} ${link}`)}`}
  >
    WhatsApp
  </a>
);

const Facebook = ({ link }: { link: string }) => (
  <a
    className="block text-small font-medium py-2 px-6 hover:text-social-facebook group-focus:text-social-facebook"
    target="_blank"
    rel="noopener noreferrer"
    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURI(link)}`}
  >
    Facebook
  </a>
);

const Twitter = ({ link, text }: { link: string; text: string }) => (
  <a
    className="block text-small font-medium py-2 px-6 hover:text-social-twitter group-focus:text-social-twitter"
    target="_blank"
    rel="noopener noreferrer"
    href={`https://twitter.com/intent/tweet?text=${encodeURI(
      text
    )}&url=${encodeURI(link)}&via=refugeworldwide`}
  >
    Twitter
  </a>
);

const Telegram = ({ link, text }: { link: string; text: string }) => (
  <a
    className="block text-small font-medium py-2 px-6 hover:text-social-telegram group-focus:text-social-telegram"
    target="_blank"
    rel="noopener noreferrer"
    href={`https://telegram.me/share/url?url=${encodeURI(
      link
    )}&text=${encodeURI(text)}`}
  >
    Telegram
  </a>
);
