/** @type {import('tailwindcss').Config}*/
const config = {
  content: ["./src/**/*.{html,js,svelte,ts}", './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],

  plugins: [require('flowbite/plugin')],

  darkMode: 'class',

  theme: {
    colors: {
      // flowbite-svelte
      primary: {
        ...require('tailwindcss/colors').lime,
        DEFAULT: require('tailwindcss/colors').lime[300],
        on: require('tailwindcss/colors').slate[800],
        variant: {
          DEFAULT: require('tailwindcss/colors').lime[600],
          on: require('tailwindcss/colors').slate[50],
        },
      },
      secondary: {
        ...require('tailwindcss/colors').fuchsia,
        DEFAULT: require('tailwindcss/colors').fuchsia[800],
        on: require('tailwindcss/colors').slate[50],
        variant: {
          DEFAULT: require('tailwindcss/colors').fuchsia[300],
          on: require('tailwindcss/colors').slate[800]
        },
      },
      tertiary: {
        ...require('tailwindcss/colors').amber,
        DEFAULT: require('tailwindcss/colors').amber[500],
        on: require('tailwindcss/colors').slate[50],
        variant: {
          DEFAULT: require('tailwindcss/colors').amber[200],
          on: require('tailwindcss/colors').slate[800]
        },
      },
    },
  },
}


module.exports = config;
