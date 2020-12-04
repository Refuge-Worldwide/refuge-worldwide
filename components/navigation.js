import Link from "next/link";
import NavigationLink from "./navigationLink";

export default function Navigation() {
  return (
    <nav className="text-black">
      <ul className="grid grid-cols-10">
        <li className="col-span-4">
          <Link href="/">
            <a>Refuge Worldwide</a>
          </Link>
        </li>
        <li className="col-span-6">
          <ul className="md:flex justify-between">
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
        </li>{" "}
      </ul>
    </nav>
  );
}
