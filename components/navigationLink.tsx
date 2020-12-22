import cn from "classnames";
import { useRouter } from "next/dist/client/router";
import Link, { LinkProps } from "next/link";

interface NavigationLink extends React.PropsWithChildren<LinkProps> {
  activeClassName: string;
}

export default function NavigationLink({
  activeClassName,
  children,
  href,
  ...rest
}: NavigationLink) {
  const { pathname } = useRouter();

  const isActive = pathname === href;

  const className = cn(
    "font-medium transition-colors duration-150 ease-in-out",
    `hover:${activeClassName}`,
    {
      [activeClassName]: isActive,
    }
  );

  return (
    <Link href={href} {...rest}>
      <a className={className}>{children}</a>
    </Link>
  );
}
