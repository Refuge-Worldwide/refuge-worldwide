import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import cn from "classnames";

interface NavigationLink extends React.PropsWithChildren<LinkProps> {
  activeClassName: string;
}

export default function MobileMenuLink({
  activeClassName,
  children,
  href,
  ...rest
}: NavigationLink) {
  const { pathname } = useRouter();

  const isActive = pathname === href;

  const classNames = cn(
    "text-large font-medium transition-colors duration-150 ease-in-out focus:outline-none",
    {
      [activeClassName]: isActive,
    }
  );

  return (
    <Link href={href} {...rest}>
      <a className={classNames}>{children}</a>
    </Link>
  );
}
