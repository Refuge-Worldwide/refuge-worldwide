interface LayoutType extends JSX.Element {
  preview?: boolean;
}

export default function Layout({ preview, children }): LayoutType {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
