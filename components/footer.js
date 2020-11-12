import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <h3>About Refuge</h3>
      <p>
        Refuge is a fundraising platform working in solidarity with grass- roots
        and non-profit organizations.
      </p>
      <p>
        Since 2015, we have donated over €50,000 EUR to community groups in
        Berlin, by raising money at our basement parties, week- end-long raves,
        and a street food festival.
      </p>
      <p>
        <Link href="/about">
          <a>Read more about us</a>
        </Link>
      </p>
    </footer>
  );
}
