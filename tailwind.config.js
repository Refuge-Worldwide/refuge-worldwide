module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: [
    "./pages/**/*.js",
    "./pages/**/*.tsx",
    "./views/**/*.js",
    "./views/**/*.tsx",
    "./components/**/*.js",
    "./components/**/*.tsx",
  ],
  theme: {
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
    },
  },
  variants: {},
  plugins: [],
};
