import Marquee3k from "marquee3000";
import { useEffect } from "react";
import { isServer } from "../util";

export default function useMarquee3k(deps = []) {
  useEffect(() => {
    if (!isServer) Marquee3k?.init();
  }, deps);
}
