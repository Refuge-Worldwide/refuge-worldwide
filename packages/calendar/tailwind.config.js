/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      /**
       * Custom font sizes used in the calendar UI.
       * These are wired to CSS custom properties so stations can remap them.
       */
      fontSize: {
        xxs: ["0.75rem", { lineHeight: "1.1" }],
        tiny: ["1rem", { lineHeight: "1" }],
        small: ["1.25rem", { lineHeight: "1.3" }],
      },
      /**
       * Custom colours. Using CSS variables with hardcoded fallbacks means
       * stations can override any colour by setting the variable in their CSS
       * without touching Tailwind at all.
       */
      colors: {
        red: "var(--cal-color-error,  #ff0000)",
        grey: "var(--cal-color-subtle, #ececec)",
        blue: "var(--cal-color-accent, #4d7cff)",
      },
      boxShadow: {
        "pill-black": "0 2px 0 0 var(--cal-color-border, #000)",
      },
      borderWidth: {
        1.5: "1.5px",
      },
      /** Dialog animations (consumed via data-[state=open]:animate-overlayShow etc.) */
      keyframes: {
        overlayShow: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        contentShow: {
          from: {
            opacity: "0",
            transform: "translate(-50%, -48%) scale(0.96)",
          },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
      },
      animation: {
        overlayShow: "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        contentShow: "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
};
