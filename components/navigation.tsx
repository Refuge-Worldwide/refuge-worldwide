import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { INSTAGRAM_URL, SHOP_URL } from "../constants";
import Instagram from "../icons/instagram";
import { Menu } from "../icons/menu";
import Search from "../icons/search";
import NavigationLink from "./navigationLink";

const MobileMenu = dynamic(() => import("../components/mobileMenu"));

export default function Navigation() {
  const [isOpen, isOpenSet] = useState(false);
  const openMenu = () => isOpenSet(true);
  const closeMenu = () => isOpenSet(false);

  return (
    <nav className="text-black">
      <div className="px-4 md:px-8 py-2.5">
        <ul className="flex items-center">
          <li>
            <Link href="/">
              <a className="flex">
                <img
                  src="/images/navigation-smile.svg"
                  width={66}
                  height={40}
                  alt="Refuge"
                  loading="eager"
                />
              </a>
            </Link>
          </li>

          <li className="block lg:hidden ml-auto">
            <button
              onClick={openMenu}
              className="flex focus:outline-none focus:ring-4"
            >
              <span className="sr-only">Open Menu</span>
              <span aria-hidden>
                <Menu />
              </span>
            </button>
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
                  href="/support"
                  activeClassName="text-pink"
                  className="hover:text-pink focus:text-pink"
                >
                  Support
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
                  activeClassName="text-blue"
                  className="hover:text-blue focus:text-blue"
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
                  <li>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={INSTAGRAM_URL}
                    >
                      <Instagram />
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <MobileMenu onDismiss={closeMenu} isOpen={isOpen} />
    </nav>
  );
}
