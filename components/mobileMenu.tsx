import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Image from "next/future/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { forwardRef, useEffect } from "react";
import { INSTAGRAM_URL, SHOP_URL, TWITTER_URL } from "../constants";
import Instagram from "../icons/instagram";
import { Close } from "../icons/menu";
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
            <Link href="/">
              <a className="flex">
                <Image
                  src="/images/navigation-smile-white.svg"
                  width={66}
                  height={40}
                  alt="Refuge"
                  priority
                  unoptimized
                  className="h-10 w-[4.125rem]"
                />
              </a>
            </Link>
          </li>

          <li>
            <Dialog.Close className="flex focus:outline-none focus:ring-4">
              <span className="sr-only">Close</span>
              <span aria-hidden>
                <Close />
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
    </div>
  );
}

export const MobileMenu = forwardRef<HTMLDivElement, { onDismiss: () => void }>(
  ({ onDismiss, ...props }, forwardedRef) => {
    return (
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black focus:outline-none z-50 overflow-y-scroll">
          <Dialog.Content {...props} ref={forwardedRef}>
            <VisuallyHidden.Root asChild>
              <Dialog.Title>Mobile Navigation</Dialog.Title>
            </VisuallyHidden.Root>

            <MobileMenuContent onDismiss={onDismiss} />
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    );
  }
);

MobileMenu.displayName = "MobileMenu";
