import cn from "classnames";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import Facebook from "../icons/facebook";
import Instagram from "../icons/instagram";
import NavigationLink from "./navigationLink";

function useActivePath(path = "/") {
  const { pathname } = useRouter();

  return pathname === path;
}

function NavigationLogo() {
  const isHome = useActivePath();

  let image = <img src="/images/navigation-smile.svg" alt="Refuge" />;

  if (isHome)
    image = (
      <img
        src="/images/navigation-smile-full.svg"
        alt="Refuge Social Clubbing Worldwild"
      />
    );

  return (
    <Link href="/">
      <a>{image}</a>
    </Link>
  );
}

export default function Navigation() {
  const isHome = useActivePath();

  const contentWrapperClassNames = cn(
    "px-4 md:px-8",
    isHome ? "py-6" : "py-2.5"
  );

  return (
    <nav className="text-black">
      <div className={contentWrapperClassNames}>
        <ul className="flex items-center">
          <li>
            <NavigationLogo />
          </li>
          <li className="flex-1">
            <ul className="md:flex justify-end items-center space-x-6 lg:space-x-8 xl:space-x-14">
              <li>
                <NavigationLink href="/radio" activeClassName="text-orange">
                  Radio
                </NavigationLink>
              </li>
              <li>
                <NavigationLink href="/news" activeClassName="text-green">
                  News
                </NavigationLink>
              </li>
              <li>
                <NavigationLink href="/artists" activeClassName="text-purple">
                  Artists
                </NavigationLink>
              </li>
              <li>
                <NavigationLink href="/support" activeClassName="text-pink">
                  Support
                </NavigationLink>
              </li>
              <li>
                <NavigationLink href="/about" activeClassName="text-brown">
                  About
                </NavigationLink>
              </li>
              <li>
                <NavigationLink href="/newsletter" activeClassName="text-blue">
                  Newsletter
                </NavigationLink>
              </li>
              <li>
                <ul className="flex space-x-6">
                  <li>
                    <a href="#instagram">
                      <Instagram />
                    </a>
                  </li>
                  <li>
                    <a href="#facebook">
                      <Facebook />
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}
