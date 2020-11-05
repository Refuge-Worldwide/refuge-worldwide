import Meta from "./meta";

interface LayoutType extends JSX.Element {
  preview?: boolean;
}

export default function Layout({ preview, children }): LayoutType {
  return (
    <>
      <Meta />
      <main>{children}</main>
    </>
  );
}
