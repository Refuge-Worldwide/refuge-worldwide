import cn from "classnames";

export default function Pill({ children, invert = false, small = false }) {
  const className = cn(
    "inline-flex px-6 items-center border-2 rounded-full leading-none",
    invert
      ? "bg-black text-white border-white shadow-pill-white"
      : "bg-white text-black border-black shadow-pill-black",
    small ? "pill-small" : "pill"
  );

  return <div className={className}>{children}</div>;
}
