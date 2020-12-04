import Link from "next/link";
import { Arrow } from "../icons/arrow";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="md:grid grid-cols-10 pt-28 pb-20">
        <div className="col-span-1" />
        <div className="col-span-4"></div>
        <div className="col-span-4">
          <div className="space-y-7">
            <h3 className="text-large leading-none">About Refuge</h3>
            <p className="font-medium leading-tight">
              Refuge is a fundraising platform working in solidarity with
              grass-roots and non-profit organizations.
            </p>
            <p className="font-medium leading-tight">
              Since 2015, we have donated over €50,000 EUR to community groups
              in Berlin, by raising money at our basement parties, week-end-long
              raves, and a street food festival.
            </p>
            <p className="font-medium leading-tight">
              <Link href="/about">
                <a className="underline">Read more about us</a>
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white pt-28 pb-28">
        <div className="flex items-center justify-between">
          {/* Offset */}
          <div className="flex-1" />

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

          <div className="flex-1 flex justify-end space-x-12">
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
