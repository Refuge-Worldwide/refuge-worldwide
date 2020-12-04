import cn from "classnames";

export default function Badge({
  text,
  invert,
}: {
  text: string;
  invert?: boolean;
}) {
  const classNames = cn(
    "inline-flex px-3 py-2 text-tiny uppercase font-medium border-1.5 rounded-full border-black whitespace-nowrap",
    invert ? "bg-black text-white" : "bg-transparent text-black"
  );

  return <div className={classNames}>{text}</div>;
}
