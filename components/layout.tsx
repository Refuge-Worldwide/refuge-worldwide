import Meta from "./meta";

export default function Layout({
  preview,
  children,
}: {
  preview: boolean;
}): JSX.Element {
  return (
    <>
      <Meta />
      <main>{children}</main>
    </>
  );
}
