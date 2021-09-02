import { Menu } from "@headlessui/react";
import classNames from "classnames";
import Share from "../icons/share";

export default function ShareMenu({ url }: { url: string }) {
  const TEXT =
    "Refuge Worldwide is a community radio station and fundraising platform based in Berlin.";

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="w-20 h-20 sm:w-28 sm:h-28 focus:outline-none">
          <Share />
        </Menu.Button>
      </div>

      <Menu.Items className="absolute left-0 mt-2 bg-black text-white focus:outline-none">
        <div className="pt-4 pb-4">
          <Menu.Item>
            {({ active }) => (
              <WhatsApp link={url} text={TEXT} active={active} />
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => <Facebook link={url} active={active} />}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => <Twitter link={url} text={TEXT} active={active} />}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Telegram link={url} text={TEXT} active={active} />
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}

const menuItemClasses = "block text-small font-medium py-2 px-6";

const WhatsApp = ({ link, text, active = false }) => (
  <a
    className={classNames(
      menuItemClasses,
      "hover:text-social-whatsapp",
      active ? "text-social-whatsapp" : ""
    )}
    target="_blank"
    rel="noopener noreferrer"
    href={`https://wa.me/?text=${encodeURI(`${text} ${link}`)}`}
  >
    WhatsApp
  </a>
);

const Facebook = ({ link, active = false }) => (
  <a
    className={classNames(
      menuItemClasses,
      "hover:text-social-facebook",
      active ? "text-social-facebook" : ""
    )}
    target="_blank"
    rel="noopener noreferrer"
    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURI(link)}`}
  >
    Facebook
  </a>
);

const Twitter = ({ link, text, active = false }) => (
  <a
    className={classNames(
      menuItemClasses,
      "hover:text-social-twitter",
      active ? "text-social-twitter" : ""
    )}
    target="_blank"
    rel="noopener noreferrer"
    href={`https://twitter.com/intent/tweet?text=${encodeURI(
      text
    )}&url=${encodeURI(link)}&via=refugeworldwide`}
  >
    Twitter
  </a>
);

const Telegram = ({ link, text, active = false }) => (
  <a
    className={classNames(
      menuItemClasses,
      "hover:text-social-telegram",
      active ? "text-social-telegram" : ""
    )}
    target="_blank"
    rel="noopener noreferrer"
    href={`https://telegram.me/share/url?url=${encodeURI(
      link
    )}&text=${encodeURI(text)}`}
  >
    Telegram
  </a>
);
