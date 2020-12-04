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
      tiny: "1rem",
      small: "1.25rem",
      base: "1.875rem",
      large: "2.8125rem",
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
    },
    extend: {
      boxShadow: {
        "pill-black": "0 2px 0 0 rgb(0, 0, 0)",
        "pill-white": "0 2px 0 0 rgb(255, 255, 255)",
      },
      borderWidth: {
        1.5: "1.5px",
      },
    },
  },
  corePlugins: {
    container: false,
  },
  variants: {},
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
