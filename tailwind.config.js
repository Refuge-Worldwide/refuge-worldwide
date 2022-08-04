module.exports = {
  content: [
    "./components/**/*.{ts,tsx}",
    "./icons/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./views/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    fontWeight: {
      light: 300,
      medium: 500,
    },
    fontSize: {
      xxs: ["0.75rem", 1.1111111111],
      tiny: ["1rem", 1],
      small: ["1.25rem", 1.3],
      base: ["1.875rem", 1.2666666667],
      large: ["2.8125rem", 1.1111111111],
    },
    fontFamily: {
      sans: [
        "Visuelt",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji",
      ],
      serif: [
        "bely-display",
        "Georgia",
        "Cambria",
        "Times New Roman",
        "Times",
        "serif",
      ],
    },
    colors: {
      blue: "#4d7cff",
      brown: "#815900",
      green: "#08c900",
      orange: "#ff9300",
      pink: "#ff27c5",
      purple: "#a346ff",
      red: "#ff0000",
      black: "#000",
      white: "#fff",
      transparent: "transparent",
      social: {
        telegram: "#26A5E4",
        twitter: "#1DA1F2",
        facebook: "#1877F2",
        instagram: "#E4405F",
        whatsapp: "#25D366",
      },
    },
    extend: {
      boxShadow: {
        "pill-black": "0 2px 0 0 rgb(0, 0, 0)",
        "pill-white": "0 2px 0 0 rgb(255, 255, 255)",
      },
      borderWidth: {
        1.5: "1.5px",
      },
      animation: {
        "spin-slow": "spin 4s linear infinite",
      },
      spacing: {
        112: "32rem",
        "cover-image": "45rem",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.black"),
            "--tw-prose-headings": theme("colors.black"),
            "--tw-prose-lead": theme("colors.black"),
            "--tw-prose-links": theme("colors.black"),
            "--tw-prose-bold": theme("colors.black"),
            "--tw-prose-counters": theme("colors.black"),
            "--tw-prose-bullets": theme("colors.black"),
            "--tw-prose-hr": theme("colors.black"),
            "--tw-prose-quotes": theme("colors.black"),
            "--tw-prose-quote-borders": theme("colors.black"),
            "--tw-prose-captions": theme("colors.black"),
            "--tw-prose-code": theme("colors.black"),
            "--tw-prose-pre-code": theme("colors.black"),
            "--tw-prose-pre-bg": theme("colors.black"),
            "--tw-prose-th-borders": theme("colors.black"),
            "--tw-prose-td-borders": theme("colors.black"),

            fontSize: "1.25rem",
            lineHeight: "1.5",
            h1: {
              fontWeight: "normal",
              fontSize: "1.875rem",
              lineHeight: "1.2666666667",

              textAlign: "center",
            },
            h2: {
              fontWeight: "normal",
              fontSize: "1.875rem",
              lineHeight: "1.2666666667",

              textAlign: "center",
            },
            h3: {
              fontWeight: "normal",
              fontSize: "1.875rem",
              lineHeight: "1.2666666667",

              textAlign: "center",
            },
            h4: {
              fontWeight: "normal",
              fontSize: "1.25rem",
              lineHeight: "1.5",
            },
            h5: {
              fontWeight: "normal",
              fontSize: "1.25rem",
              lineHeight: "1.5",
            },
            h6: {
              fontWeight: "normal",
              fontSize: "1.25rem",
              lineHeight: "1.5",
            },
          },
        },
        lg: {
          css: {
            fontSize: "1.875rem",
            lineHeight: "1.2666666667",
            h1: {
              fontSize: "2.8125rem",
              lineHeight: "1.1111111111",

              textAlign: "center",
            },
            h2: {
              fontSize: "2.8125rem",
              lineHeight: "1.1111111111",

              textAlign: "center",
            },
            h3: {
              fontSize: "2.8125rem",
              lineHeight: "1.1111111111",

              textAlign: "center",
            },
            h4: {
              fontSize: "1.875rem",
              lineHeight: "1.2666666667",
            },
            h5: {
              fontSize: "1.875rem",
              lineHeight: "1.2666666667",
            },
            h6: {
              fontSize: "1.875rem",
              lineHeight: "1.2666666667",
            },
          },
        },
      }),
    },
  },
  corePlugins: {
    container: false,
  },
  plugins: [
    require("@tailwindcss/typography")({
      modifiers: ["lg"],
    }),
    require("@tailwindcss/forms"),
  ],
};
