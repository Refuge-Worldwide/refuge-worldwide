import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { MobileMenu } from "../components/mobileMenu";
import { INSTAGRAM_URL, SHOP_URL, DISCORD_INVITE_URL } from "../constants";
import Instagram from "../icons/instagram";
import { Menu } from "../icons/menu";
import MessageSquare from "../icons/message-square";
import Search from "../icons/search";
import NavigationLink from "./navigationLink";
import { useUser } from "@supabase/auth-helpers-react";
import { AiOutlineCalendar } from "react-icons/ai";

export default function Navigation() {
  const [isOpen, isOpenSet] = useState(false);
  const onDismiss = () => isOpenSet(false);

  const openChat = useCallback(() => {
    const chatOptions =
      "width=480,height=520,menubar=no,location=no,resizable=no,scrollbars=no,status=no";

    window.open("/chat", "refugechatwindow", chatOptions);
  }, []);

  const user = useUser();

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => isOpenSet(open)}>
      <nav className="text-black">
        <div className="px-4 md:px-8 py-2.5">
          <ul className="flex items-center">
            <li>
              <Link href="/" className="flex">
                <Image
                  src="/images/navigation-smile.svg"
                  width={66}
                  height={40}
                  alt="Refuge"
                  priority
                  unoptimized
                  className="h-10 w-[4.125rem]"
                />
              </Link>
            </li>

            <li className="li flex lg:hidden gap-6 ml-auto">
              <a
                className="flex focus:outline-none focus:ring-4"
                target="_blank"
                rel="noopener noreferrer"
                href="/chat"
              >
                <span className="sr-only">Open Chat</span>
                <span aria-hidden>
                  <MessageSquare size={32} strokeWidth={1.5} />
                </span>
              </a>

              <Dialog.Trigger className="flex focus:outline-none focus:ring-4">
                <span className="sr-only">Open Menu</span>
                <span aria-hidden>
                  <Menu size={32} />
                </span>
              </Dialog.Trigger>
            </li>

            <li className="hidden lg:block flex-1">
              <ul className="md:flex justify-end items-center  space-x-6 xl:space-x-8 2xl:space-x-14">
                <li>
                  <NavigationLink
                    href="/radio"
                    activeClassName="text-orange"
                    className="hover:text-orange focus:text-orange"
                  >
                    Radio
                  </NavigationLink>
                </li>
                <li>
                  <NavigationLink
                    href="/news"
                    activeClassName="text-green"
                    className="hover:text-green focus:text-green"
                  >
                    News
                  </NavigationLink>
                </li>
                <li>
                  <NavigationLink
                    href="/artists"
                    activeClassName="text-purple"
                    className="hover:text-purple focus:text-purple"
                  >
                    Artists
                  </NavigationLink>
                </li>
                <li>
                  <NavigationLink
                    href="/events"
                    activeClassName="text-blue"
                    className="hover:text-blue focus:text-blue"
                  >
                    Events
                  </NavigationLink>
                </li>
                <li>
                  <NavigationLink
                    href="/about"
                    activeClassName="text-brown"
                    className="hover:text-brown focus:text-brown"
                  >
                    About
                  </NavigationLink>
                </li>
                <li>
                  <NavigationLink
                    href="/newsletter"
                    activeClassName="text-pink"
                    className="hover:text-pink focus:text-pink"
                  >
                    Newsletter
                  </NavigationLink>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium transition-colors duration-150 ease-in-out hover:text-red focus:text-red"
                    href={SHOP_URL}
                  >
                    Shop
                  </a>
                </li>
                <li>
                  <ul className="flex space-x-6">
                    <li>
                      <NavigationLink
                        href="/search"
                        activeClassName="text-red"
                        className="hover:text-red focus:text-red"
                      >
                        <Search />
                      </NavigationLink>
                    </li>
                    <li className="h-6 leading-none">
                      <a href="/chat" target="_blank" rel="noopener noreferrer">
                        <MessageSquare />
                      </a>
                    </li>
                    <li>
                      {user ? (
                        <Link href="/admin/calendar">
                          <AiOutlineCalendar />
                        </Link>
                      ) : (
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={INSTAGRAM_URL}
                        >
                          <Instagram />
                        </a>
                      )}
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>

      <MobileMenu onDismiss={onDismiss} />
    </Dialog.Root>
  );
}
