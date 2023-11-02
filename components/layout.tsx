import { Fragment } from "react";
import Alert from "./alert";
import Edit from "./edit";

export default function Layout({
  className,
  children,
  preview,
  pageId,
}: {
  children: React.ReactNode;
  preview?: boolean;
  className?: string;
  pageId?: string;
}) {
  return (
    <Fragment>
      {preview && <Alert />}
      <Edit id={pageId} />
      <main className={className}>{children}</main>
    </Fragment>
  );
}
