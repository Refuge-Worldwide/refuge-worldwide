import cn from "classnames";

export default function Pill({ children, invert = false }) {
  const className = cn(
    "pill inline-flex px-6 items-center border-2 rounded-full leading-none",
    invert
      ? "bg-black text-white border-white shadow-pill-white"
      : "bg-white text-black border-black shadow-pill-black"
  );

  return <div className={className}>{children}</div>;
}
