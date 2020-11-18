import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="md:grid grid-cols-10">
        <div className="col-span-1" />
        <div className="col-span-4"></div>
        <div className="col-span-4">
          <h3>About Refuge</h3>
          <p>
            Refuge is a fundraising platform working in solidarity with
            grass-roots and non-profit organizations.
          </p>
          <p>
            Since 2015, we have donated over €50,000 EUR to community groups in
            Berlin, by raising money at our basement parties, week-end-long
            raves, and a street food festival.
          </p>
          <p>
            <Link href="/about">
              <a>Read more about us</a>
            </Link>
          </p>
        </div>
      </div>

      <div className="border-t border-white">
        <p>
          <a href="#top">Go up</a>
        </p>

        <p>
          <Link href="/imprint">
            <a>Imprint</a>
          </Link>
        </p>

        <p>
          <Link href="/privacy">
            <a>Privacy</a>
          </Link>
        </p>
      </div>
    </footer>
  );
}