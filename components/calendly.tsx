import { useEffect } from "react";
import useScript from "../hooks/useScript";

export default function CalendlyEmbed({ shouldInit }: { shouldInit: boolean }) {
  const scriptStatus = useScript(
    "//assets.calendly.com/assets/external/widget.js"
  );

  useEffect(() => {
    if (shouldInit === false || scriptStatus !== "ready") {
      return;
    }

    (window as any).Calendly.initInlineWidget({
      url: "https://calendly.com/studio-booking-refuge-worldwide/booking",
      parentElement: document.getElementById("calendly-embed"),
      prefill: {},
      utm: {},
    });
  }, [scriptStatus, shouldInit]);

  return <div id="calendly-embed" className="h-screen" />;
}
