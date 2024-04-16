/** @type {import('tailwindcss').Config}*/
const config = {
  content: ["./src/**/*.{html,js,svelte,ts}", './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],

  plugins: [require('flowbite/plugin')],

  darkMode: 'class',

  theme: {
    colors: {
      // flowbite-svelte
      primary: {
        50: '#E0F2F1',
        100: '#B2DFDB',
        200: '#80CBC4',
        300: '#4DB6AC',
        400: '#26A69A',
        500: '#009688',
        600: '#00897B',
        700: '#00796B',
        800: '#00695C',
        900: '#004D40'
      },
    },
  },
}


module.exports = config;
