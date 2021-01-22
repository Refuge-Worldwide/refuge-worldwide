import { useRef } from "react";
import useMarquee from "../hooks/useMarquee";

export default function Marquee({ text, ...rest }) {
  const ref = useRef<HTMLDivElement>();
  useMarquee(ref);

  return (
    <div className="flex-1 truncate mt-0.5" {...rest}>
      <div ref={ref}>
        <div className="whitespace-nowrap leading-none pr-8">{text}</div>
      </div>
    </div>
  );
}
