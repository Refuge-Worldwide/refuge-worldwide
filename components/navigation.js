import Link from "next/link";

export default function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">
            <a>Refuge Worldwide</a>
          </Link>
        </li>
        <li>
          <Link href="/radio">
            <a>Radio</a>
          </Link>
        </li>
        <li>
          <Link href="/news">
            <a>News</a>
          </Link>
        </li>
        <li>
          <Link href="/artists">
            <a>Artists</a>
          </Link>
        </li>
        <li>
          <Link href="/support">
            <a>Support</a>
          </Link>
        </li>
        <li>
          <Link href="/about">
            <a>About</a>
          </Link>
        </li>
        <li>
          <Link href="/newsletter">
            <a>Newsletter</a>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
