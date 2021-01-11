import { useEffect } from "react";
import smoothscroll from "smoothscroll-polyfill";

export default function useSmoothscrollPolyfill() {
  useEffect(() => smoothscroll.polyfill(), []);
}
