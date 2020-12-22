import Link from "next/link";
import { Arrow } from "../icons/arrow";

export default function Footer() {
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
                <a href="#patreon" className="underline">
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
        <div className="grid md:grid-cols-3 gap-12 text-small font-medium">
          {/* Spacer */}
          <div className="hidden md:block" />

          <div className="flex justify-center">
            <p>
              <a href="#top" className="inline-flex items-center space-x-4">
                <span>Go up</span>
                <span className="mt-1">
                  <Arrow className="transform -rotate-90" size={24} />
                </span>
              </a>
            </p>
          </div>

          <div className="flex-1 flex justify-center md:justify-end space-x-12">
            <p>
              <a
                href="mailto:hello@refugeworldwide.com"
                className="font-medium"
              >
                Contact
              </a>
            </p>

            <p>
              <Link href="/imprint">
                <a className="font-medium">Imprint</a>
              </Link>
            </p>

            <p>
              <Link href="/privacy">
                <a className="font-medium">Privacy</a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
