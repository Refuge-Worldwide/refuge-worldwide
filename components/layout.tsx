import Meta from "./meta";
import Navigation from "./navigation";

interface LayoutType extends JSX.Element {
  preview?: boolean;
}

export default function Layout({ preview, children }): LayoutType {
  return (
    <>
      <Meta />

      <header>
        <Navigation />
      </header>

      <main>{children}</main>
    </>
  );
}
