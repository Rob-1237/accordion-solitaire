export default {
  plugins: {
    // Use the dedicated PostCSS plugin for Tailwind CSS
    '@tailwindcss/postcss': {}, // <--- THIS LINE IS THE KEY CHANGE
    autoprefixer: {},
  },
};