import cn from "classnames";

export default function Pill({ children, invert = false }) {
  const className = cn(
    "inline-flex border-2 rounded-full",
    invert
      ? "bg-black text-white border-white shadow-pill-white"
      : "bg-white text-black border-black shadow-pill-black"
  );

  return <div className={className}>{children}</div>;
}
