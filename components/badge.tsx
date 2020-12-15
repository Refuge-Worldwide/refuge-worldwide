import cn from "classnames";

export default function Badge({
  text,
  invert,
}: {
  text: string;
  invert?: boolean;
}) {
  const classNames = cn(
    "block px-3 py-2 text-tiny uppercase font-medium border-1.5 rounded-full whitespace-nowrap",
    invert
      ? "bg-black text-white border-white"
      : "bg-transparent text-black border-black"
  );

  return <div className={classNames}>{text}</div>;
}
