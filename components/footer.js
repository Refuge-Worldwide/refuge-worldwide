import Link from "next/link";
import { Arrow } from "../icons/arrow";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="px-4 md:px-8 pt-10 md:pt-28 pb-8 md:pb-20">
        <div className="container md:grid items-center grid-cols-2">
          <div className="mb-6 md:mb-0">
            <img
              className="mx-auto h-32 sm:h-40 lg:h-64 w-auto object-contain"
              src="/images/footer-smile.svg"
              alt=""
            />
          </div>
          <div>
            <h3 className="text-base sm:text-large leading-none">
              About Refuge
            </h3>

            <div className="h-3 md:h-7" />

            <div className="space-y-7">
              <p className="font-medium leading-tight">
                Refuge is a fundraising platform working in solidarity with
                grass-roots and non-profit organizations.
              </p>
              <p className="font-medium leading-tight">
                Since 2015, we have donated over €50,000 EUR to community groups
                in Berlin, by raising money at our basement parties,
                week-end-long raves, and a street food festival.
              </p>
              <p className="font-medium leading-tight">
                <Link href="/about">
                  <a className="underline">Read more about us</a>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 border-t border-white pt-10 md:pt-28 pb-16 md:pb-28">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Spacer */}
          <div className="hidden md:block" />

          <div className="flex justify-center">
            <p>
              <a
                href="#top"
                className="inline-flex items-center text-white font-medium space-x-4"
              >
                <span>Go up</span>
                <span className="mt-1">
                  <Arrow className="transform -rotate-90" size={24} />
                </span>
              </a>
            </p>
          </div>

          <div className="flex-1 flex justify-center md:justify-end space-x-12">
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
