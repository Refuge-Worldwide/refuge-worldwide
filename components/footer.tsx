import Link from "next/link";
import { MIXCLOUD_URL, PATREON_URL, SOUNDCLOUD_URL } from "../constants";
import { Arrow } from "../icons/arrow";
import Mixcloud from "../icons/mixcloud";
import Soundcloud from "../icons/soundcloud";

export default function Footer() {
  const handleGoToTop = () =>
    window?.scroll({ top: 0, left: 0, behavior: "smooth" });

  return (
    <footer className="bg-black text-white">
      <div className="px-4 md:px-8 pt-10 md:pt-20 pb-8 md:pb-20">
        <div className="container md:grid items-center grid-cols-2">
          <div className="mb-6 md:mb-0">
            <img
              className="mx-auto h-32 sm:h-40 lg:h-48 w-auto object-contain"
              src="/images/footer-smile.svg"
              alt=""
            />
          </div>
          <div>
            <h3 className="text-base leading-none">About Refuge</h3>

            <div className="h-3 md:h-7" />

            <div className="space-y-7 max-w-xl text-small font-medium leading-tight">
              <p>
                Refuge began in 2015 as a fundraising platform working in
                solidarity with grassroots and non-profit organizations across
                Berlin. In 2020 an idea for Refuge Worldwide radio station was
                hatched, with the station broadcasting remotely from 2021 based
                out of Neukölln.
              </p>
              <p>
                We are a non-commercial independent platform, amplifying voices
                and creating unity in the community. If you are able to, please
                consider{" "}
                <a href={PATREON_URL} className="underline">
                  supporting us via Patreon
                </a>
                .
              </p>
              <p>
                <Link href="/about">
                  <a className="underline">Read more about us</a>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 border-t border-white pt-10 md:pt-16 pb-10 md:pb-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 text-small font-medium">
          {/* Spacer */}
          <div className="hidden lg:block" />

          <div className="flex justify-center">
            <button
              onClick={handleGoToTop}
              className="focus:outline-none inline-flex items-center space-x-4"
            >
              <span>Go up</span>
              <span className="mt-1">
                <Arrow className="transform -rotate-90" size={24} />
              </span>
            </button>
          </div>

          <ul className="flex-1 lg:flex justify-end items-center space-y-4 lg:space-y-0 lg:space-x-8 xl:space-x-12">
            <li>
              <a
                href="mailto:hello@refugeworldwide.com"
                className="font-medium"
              >
                Contact
              </a>
            </li>

            <li>
              <a href={SOUNDCLOUD_URL}>
                <Soundcloud />
              </a>
            </li>

            <li>
              <a href={MIXCLOUD_URL}>
                <Mixcloud />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="px-4 md:px-8 border-t border-white py-4 md:py-8">
        <div className="font-medium text-center text-xxs">
          <p>
            Designed by{" "}
            <a
              className="underline"
              href="https://www.studiopanorama.de/?lang=en"
            >
              <span className="tracking-widest">panorama</span>
            </a>
            . Built by{" "}
            <a className="underline" href="https://reiner.design">
              mirshko
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
