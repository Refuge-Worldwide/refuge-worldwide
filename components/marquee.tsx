import { useRef } from "react";
import useMarquee from "../hooks/useMarquee";

export default function Marquee({ text, speed = 0.25, ...rest }) {
  const ref = useRef<HTMLDivElement>();
  useMarquee(ref, { speed: speed });

  return (
    <div className="flex-1 truncate mt-0.5" {...rest}>
      <div ref={ref}>
        <div className="whitespace-nowrap leading-none flex">{text}</div>
      </div>
    </div>
  );
}
