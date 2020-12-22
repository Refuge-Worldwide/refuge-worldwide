import cn from "classnames";

export default function Badge({
  text,
  invert,
  small,
}: {
  text: string;
  invert?: boolean;
  small?: boolean;
}) {
  const classNames = cn(
    "block uppercase font-medium border-1.5 rounded-full whitespace-nowrap",
    small ? "px-2 py-1 text-xxs" : "px-3 py-2 text-tiny",
    invert
      ? "bg-black text-white border-white"
      : "bg-transparent text-black border-black"
  );

  return <div className={classNames}>{text}</div>;
}
