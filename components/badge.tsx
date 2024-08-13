import cn from "classnames";
import { Cross } from "../icons/cross";
export default function Badge({
  text,
  invert,
  small,
  cross,
  as: As = "div",
  onClick,
}: {
  text: string;
  invert?: boolean;
  cross?: boolean;
  small?: boolean;
  as?: any;
  onClick?: () => void;
}) {
  const classNames = cn(
    "block uppercase font-medium border-1.5 rounded-full whitespace-nowrap focus:outline-none focus:ring-4 flex space-x-2",
    small ? "px-2 py-1 text-xxs" : "px-3 py-2 text-tiny",
    invert
      ? "bg-black text-white border-white pr-3"
      : "bg-transparent text-black border-black hover:bg-black hover:text-white"
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
  filter,
  as: As = "div",
  onClick,
}: {
  text: string;
  invert?: boolean;
  cross?: boolean;
  small?: boolean;
  eventType?: string;
  as?: any;
  filter?: boolean;
  onClick?: () => void;
}) {
  const classNames = cn(
    "block uppercase font-medium border-1.5 rounded-full whitespace-nowrap focus:outline-none focus:ring-4 flex space-x-2 text-center",
    small ? "px-2 py-1 text-xxs" : "px-3 py-2 text-tiny",
    filter ? "hover:bg-black hover:text-white" : "",
    invert ? "bg-black text-white" : ""
    // eventType == "Workshop" && filter ? "hover:bg-green" : "",
    // eventType == "Party" && filter ? "hover:bg-purple" : "",
    // eventType == "Fundraiser" && filter ? "hover:bg-orange" : "",
    // eventType == "Hang out" && filter ? "hover:bg-pink" : "",
    // eventType == "Exhibition" && filter ? "hover:bg-red" : "",
    // eventType == "Workshop" && (!filter || invert) ? "bg-green" : "",
    // eventType == "Party" && (!filter || invert) ? "bg-purple" : "",
    // eventType == "Fundraiser" && (!filter || invert) ? "bg-orange" : "",
    // eventType == "Hang out" && (!filter || invert) ? "bg-pink" : "",
    // eventType == "Exhibition" && (!filter || invert) ? "bg-red" : ""
  );

  return (
    <As
      className={classNames}
      {...(typeof onClick === "function" && { onClick })}
    >
      <span className="w-full">{text}</span>
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
