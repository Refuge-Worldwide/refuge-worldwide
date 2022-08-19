import Script from "next/script";

export default function CalendlyEmbed({ shouldInit }: { shouldInit: boolean }) {
  if (shouldInit) {
    return (
      <div id="calendly-embed" className="h-screen">
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          onLoad={() => {
            (window as any).Calendly.initInlineWidget({
              url: "https://calendly.com/studio-booking-refuge-worldwide/booking",
              parentElement: document.getElementById("calendly-embed"),
              prefill: {},
              utm: {},
            });
          }}
        />
      </div>
    );
  }

  return null;
}
