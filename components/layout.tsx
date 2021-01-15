import { Fragment } from "react";
import Alert from "./alert";

export default function Layout({
  className,
  children,
  preview,
}: {
  children: React.ReactNode;
  preview?: boolean;
  className?: string;
}) {
  return (
    <Fragment>
      {preview && <Alert />}
      <main className={className}>{children}</main>
    </Fragment>
  );
}
