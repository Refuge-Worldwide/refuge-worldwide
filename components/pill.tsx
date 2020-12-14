import cn from "classnames";

export default function Pill({
  children,
  invert = false,
  size = "large",
}: {
  children: React.ReactNode;
  invert?: boolean;
  size?: "small" | "medium" | "large";
}) {
  const className = cn(
    "inline-flex px-4 sm:px-6 items-center border-2 rounded-full leading-none",
    invert
      ? "bg-black text-white border-white shadow-pill-white"
      : "bg-white text-black border-black shadow-pill-black",
    {
      "pill-small": size === "small",
      "pill-medium": size === "medium",
      "pill-large": size === "large",
    }
  );

  return <div className={className}>{children}</div>;
}
