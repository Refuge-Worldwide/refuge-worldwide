module.exports = {
  purge: [
    "./pages/**/*.js",
    "./pages/**/*.tsx",
    "./views/**/*.js",
    "./views/**/*.tsx",
    "./components/**/*.js",
    "./components/**/*.tsx",
  ],
  theme: {
    fontWeight: {
      light: 300,
      medium: 500,
    },
    fontSize: {
      tiny: ["1rem", 1],
      small: ["1.25rem", 1.3],
      base: ["1.875rem", 1.26],
      large: ["2.8125rem", 1.1],
    },
    fontFamily: {
      sans: [
        "system-ui",
        "-apple-system",
        " BlinkMacSystemFont",
        "Segoe UI",
        " Roboto",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        " sans-serif",
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
    },
    extend: {
      boxShadow: {
        "pill-black": "0 2px 0 0 rgb(0, 0, 0)",
        "pill-white": "0 2px 0 0 rgb(255, 255, 255)",
      },
      borderWidth: {
        1.5: "1.5px",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.black"),
            fontSize: "1.25rem",
            lineHeight: "1.3",
            strong: {
              fontWeight: theme("fontWeight.medium"),
            },
            a: {
              fontWeight: theme("fontWeight.medium"),
            },
          },
        },
        lg: {
          css: {
            fontSize: "1.875rem",
            lineHeight: "1.26",
          },
        },
      }),
    },
  },
  corePlugins: {
    container: false,
  },
  variants: {},
  plugins: [
    require("@tailwindcss/typography")({
      modifiers: ["lg"],
    }),
    require("@tailwindcss/forms"),
  ],
};
