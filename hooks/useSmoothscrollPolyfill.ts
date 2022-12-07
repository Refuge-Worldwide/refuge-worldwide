import smoothscroll from "smoothscroll-polyfill";

export default function useSmoothscrollPolyfill() {
  if (typeof window === "undefined") return;
  smoothscroll.polyfill();
}
