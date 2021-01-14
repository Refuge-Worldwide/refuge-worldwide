import cn from "classnames";
import { useRouter } from "next/router";
import Link, { LinkProps } from "next/link";

interface NavigationLink extends React.PropsWithChildren<LinkProps> {
  className: string;
  activeClassName: string;
}

export default function NavigationLink({
  className = "",
  activeClassName,
  children,
  href,
  ...rest
}: NavigationLink) {
  const { pathname } = useRouter();

  const isActive = pathname.includes(String(href));

  const classNames = cn(
    className,
    "font-medium transition-colors duration-150 ease-in-out",
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
