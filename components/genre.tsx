import cn from "classnames";

export default function Genre({
  name,
  active,
}: {
  name: string;
  active?: boolean;
}) {
  const classNames = cn(
    "inline-flex px-3 py-2 text-base leading-none uppercase font-medium border-1.5 rounded-full border-black",
    active ? "bg-black text-white" : "bg-transparent text-black"
  );

  return <div className={classNames}>{name}</div>;
}
