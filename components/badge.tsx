import cn from "classnames";
import { Cross } from "../icons/cross";
export default function Badge({
  text,
  invert,
  small,
  cross,
  eventType,
  as: As = "div",
  onClick,
}: {
  text: string;
  invert?: boolean;
  cross?: boolean;
  small?: boolean;
  eventType?: string;
  as?: any;
  onClick?: () => void;
}) {
  const classNames = cn(
    "block uppercase font-medium border-1.5 rounded-full whitespace-nowrap focus:outline-none focus:ring-4 flex space-x-2",
    small ? "px-2 py-1 text-xxs" : "px-3 py-2 text-tiny",
    invert
      ? "bg-black text-white border-white pr-3"
      : "bg-transparent text-black border-black"
  );

  return (
    <As
      className={classNames}
      {...(typeof onClick === "function" && { onClick })}
    >
      <span>{text}</span>
      {invert && cross && (
        <Cross
          size={10}
          className="opacity-90"
          colour="white"
          strokeWidth="4"
        />
      )}
    </As>
  );
}

export function EventBadge({
  text,
  invert,
  small,
  cross,
  eventType,
  as: As = "div",
  onClick,
}: {
  text: string;
  invert?: boolean;
  cross?: boolean;
  small?: boolean;
  eventType?: string;
  as?: any;
  onClick?: () => void;
}) {
  const classNames = cn(
    "block uppercase font-medium border-1.5 rounded-full whitespace-nowrap focus:outline-none focus:ring-4 flex space-x-2",
    small ? "px-2 py-1 text-xxs" : "px-3 py-2 text-tiny",
    eventType == "Workshop" && !invert ? "bg-green" : "",
    eventType == "Party" && !invert ? "bg-purple" : "",
    eventType == "Fundraiser" && !invert ? "bg-orange" : "",
    eventType == "Hang out" && !invert ? "bg-pink" : "",
    eventType == "Exhibition" && !invert ? "bg-red" : "",
    invert ? "bg-black text-white border-white pr-3" : ""
  );

  return (
    <As
      className={classNames}
      {...(typeof onClick === "function" && { onClick })}
    >
      <span>{text}</span>
      {invert && cross && (
        <Cross
          size={10}
          className="opacity-90"
          colour="white"
          strokeWidth="4"
        />
      )}
    </As>
  );
}
