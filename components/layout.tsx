export default function Layout({
  preview,
  className = "",
  children,
}: {
  children: React.ReactNode;
  preview?: boolean;
  className?: string;
}) {
  return (
    <>
      <main className={className}>{children}</main>
    </>
  );
}
