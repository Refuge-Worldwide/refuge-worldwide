import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuPopover,
  MenuLink,
} from "@reach/menu-button";
import Share from "../icons/share";

export default function ShareMenu({ url }: { url: string }) {
  const TEXT =
    "Refuge Worldwide is a community radio station and fundraising platform based in Berlin.";

  return (
    <Menu>
      <MenuButton className="w-20 h-20 sm:w-28 sm:h-28 focus:outline-none">
        <Share />
      </MenuButton>
      <MenuList>
        <WhatsApp link={url} text={TEXT} />
        <Facebook link={url} />
        <Twitter link={url} text={TEXT} />
        <Telegram link={url} text={TEXT} />
      </MenuList>
    </Menu>
  );
}

const WhatsApp = ({ link, text }) => (
  <MenuLink
    className="hover:text-social-whatsapp"
    target="_blank"
    rel="noopener noreferrer"
    href={`https://wa.me/?text=${encodeURI(`${text} ${link}`)}`}
  >
    WhatsApp
  </MenuLink>
);

const Facebook = ({ link }) => (
  <MenuLink
    className="hover:text-social-facebook"
    target="_blank"
    rel="noopener noreferrer"
    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURI(link)}`}
  >
    Facebook
  </MenuLink>
);

const Twitter = ({ link, text }) => (
  <MenuLink
    className="hover:text-social-twitter"
    target="_blank"
    rel="noopener noreferrer"
    href={`https://twitter.com/intent/tweet?text=${encodeURI(
      text
    )}&url=${encodeURI(link)}&via=refugeworldwide`}
  >
    Twitter
  </MenuLink>
);

const Telegram = ({ link, text }) => (
  <MenuLink
    className="hover:text-social-telegram"
    target="_blank"
    rel="noopener noreferrer"
    href={`https://telegram.me/share/url?url=${encodeURI(
      link
    )}&text=${encodeURI(text)}`}
  >
    Telegram
  </MenuLink>
);
