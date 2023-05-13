import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { forwardRef, useEffect } from "react";
import { INSTAGRAM_URL, SHOP_URL, TWITTER_URL } from "../constants";
import Instagram from "../icons/instagram";
import { Close } from "../icons/menu";
import MessageSquare from "../icons/message-square";
import Twitter from "../icons/twitter";
import MobileMenuLink from "./mobileMenuLink";

function MobileMenuContent({ onDismiss }: { onDismiss: () => void }) {
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeStart", onDismiss);

    return () => {
      router.events.off("routeChangeStart", onDismiss);
    };
  }, [router, onDismiss]);

  return (
    <div className="px-4 pb-4 text-white">
      <nav className="py-2.5">
        <ul className="flex items-center justify-between">
          <li>
            <Link href="/" className="flex">
              <Image
                src="/images/navigation-smile-white.svg"
                width={66}
                height={40}
                alt="Refuge"
                priority
                unoptimized
                className="h-10 w-[4.125rem]"
              />
            </Link>
          </li>

          <li>
            <Dialog.Close className="flex focus:outline-none focus:ring-4">
              <span className="sr-only">Close</span>
              <span aria-hidden>
                <Close size={32} />
              </span>
            </Dialog.Close>
          </li>
        </ul>
      </nav>

      <div className="h-8" aria-hidden />

      <ul className="space-y-4">
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
          <MobileMenuLink href="/events" activeClassName="text-blue">
            Events
          </MobileMenuLink>
        </li>
        {/* <li>
          <MobileMenuLink href="/support" activeClassName="text-pink">
            Support
          </MobileMenuLink>
        </li> */}
        <li>
          <MobileMenuLink href="/about" activeClassName="text-brown">
            About
          </MobileMenuLink>
        </li>
        <li>
          <MobileMenuLink href="/newsletter" activeClassName="text-pink">
            Newsletter
          </MobileMenuLink>
        </li>
        <li>
          <a
            className="text-large font-medium focus:outline-none"
            target="_blank"
            rel="noopener noreferrer"
            href={SHOP_URL}
          >
            Shop
          </a>
        </li>
        <li>
          <MobileMenuLink href="/search" activeClassName="text-red">
            Search
          </MobileMenuLink>
        </li>
        <li>
          <ul className="flex gap-8">
            <li>
              <a
                className="flex"
                target="_blank"
                rel="noopener noreferrer"
                href={INSTAGRAM_URL}
              >
                <Instagram size={40} />
              </a>
            </li>
            <li>
              <a
                className="flex"
                target="_blank"
                rel="noopener noreferrer"
                href="https://refugeworldwide.com/chat"
              >
                <MessageSquare size={40} />
              </a>
            </li>
            <li>
              <a
                className="flex"
                target="_blank"
                rel="noopener noreferrer"
                href={TWITTER_URL}
              >
                <Twitter size={40} />
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
}

export const MobileMenu = forwardRef<HTMLDivElement, { onDismiss: () => void }>(
  ({ onDismiss, ...props }, forwardedRef) => {
    return (
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black focus:outline-none z-50 overflow-y-scroll">
          <Dialog.Content {...props} ref={forwardedRef}>
            <Dialog.Title className="sr-only">Mobile Navigation</Dialog.Title>

            <MobileMenuContent onDismiss={onDismiss} />
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    );
  }
);

MobileMenu.displayName = "MobileMenu";
