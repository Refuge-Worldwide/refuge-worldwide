import Link from "next/link";
import NavigationLink from "./navigationLink";

export default function Navigation() {
  return (
    <nav className="text-black">
      <ul>
        <li>
          <Link href="/">
            <a>Refuge Worldwide</a>
          </Link>
        </li>
        <li>
          <NavigationLink href="/radio" activeClassName="text-orange">
            Radio
          </NavigationLink>
        </li>
        <li>
          <NavigationLink href="/news" activeClassName="text-green">
            News
          </NavigationLink>
        </li>
        <li>
          <NavigationLink href="/artists" activeClassName="text-purple">
            Artists
          </NavigationLink>
        </li>
        <li>
          <NavigationLink href="/support" activeClassName="text-pink">
            Support
          </NavigationLink>
        </li>
        <li>
          <NavigationLink href="/about" activeClassName="text-brown">
            About
          </NavigationLink>
        </li>
        <li>
          <NavigationLink href="/newsletter" activeClassName="text-blue">
            Newsletter
          </NavigationLink>
        </li>
      </ul>
    </nav>
  );
}
