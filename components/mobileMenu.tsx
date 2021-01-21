import { Dialog } from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { INSTAGRAM_URL, TWITTER_URL } from "../constants";
import Instagram from "../icons/instagram";
import { Close } from "../icons/menu";
import Twitter from "../icons/twitter";
import MobileMenuLink from "./mobileMenuLink";

export default function MobileMenu({
  isOpen,
  onDismiss,
}: {
  isOpen: boolean;
  onDismiss: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);

  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeStart", onDismiss);

    return () => {
      router.events.off("routeChangeStart", onDismiss);
    };
  }, []);

  return (
    <Dialog
      onDismiss={onDismiss}
      isOpen={isOpen}
      aria-label="Mobile Navigation"
      className="bg-black h-full"
      initialFocusRef={closeButton}
    >
      <nav className="text-white">
        <div className="px-4 py-2.5">
          <ul className="flex items-center">
            <li>
              <Link href="/">
                <a className="flex">
                  <img
                    src="/images/navigation-smile-white.svg"
                    width={66}
                    height={40}
                    alt="Refuge"
                    loading="eager"
                  />
                </a>
              </Link>
            </li>

            <li className="ml-auto">
              <button
                ref={closeButton}
                onClick={onDismiss}
                className="flex focus:outline-none focus:ring-4"
              >
                <VisuallyHidden>Close</VisuallyHidden>
                <span aria-hidden>
                  <Close />
                </span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="h-8" />

      <ul className="px-4 space-y-4 text-white">
        <li>
          <MobileMenuLink href="/radio" activeClassName="text-orange">
            Radio
          </MobileMenuLink>
        </li>
        <li>
          <MobileMenuLink href="/news" activeClassName="text-green">
            News
          </MobileMenuLink>
        </li>
        <li>
          <MobileMenuLink href="/artists" activeClassName="text-purple">
            Artists
          </MobileMenuLink>
        </li>
        <li>
          <MobileMenuLink href="/support" activeClassName="text-pink">
            Support
          </MobileMenuLink>
        </li>
        <li>
          <MobileMenuLink href="/about" activeClassName="text-brown">
            About
          </MobileMenuLink>
        </li>
        <li>
          <MobileMenuLink href="/newsletter" activeClassName="text-blue">
            Newsletter
          </MobileMenuLink>
        </li>
        <li>
          <ul className="flex space-x-8">
            <li>
              <a target="_blank" rel="noopener noreferrer" href={INSTAGRAM_URL}>
                <Instagram size={40} />
              </a>
            </li>
            <li>
              <a target="_blank" rel="noopener noreferrer" href={TWITTER_URL}>
                <Twitter size={40} />
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </Dialog>
  );
}
