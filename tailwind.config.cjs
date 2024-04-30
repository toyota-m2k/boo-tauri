/** @type {import('tailwindcss').Config}*/
const config = {
  content: ["./src/**/*.{html,js,svelte,ts}", './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],

  plugins: [require('flowbite/plugin')],

  darkMode: 'class',

  theme: {
    colors: {
      // flowbite-svelte
      // primary: {
      //   ...require('tailwindcss/colors').lime,
      //   DEFAULT: require('tailwindcss/colors').lime[300],
      //   on: require('tailwindcss/colors').slate[800],
      //   variant: {
      //     DEFAULT: require('tailwindcss/colors').lime[600],
      //     on: require('tailwindcss/colors').slate[50],
      //   },
      // },
      primary: {
        DEFAULT: "var(--color-primary)",
        on: {
          DEFAULT: "var(--color-primary-on)",
          alt: "var(--color-primary-on-alt)",
        },
        variant: {
          DEFAULT: "var(--color-primary-variant)",
          on: "var(--color-primary-variant-on)",
        },
      },
      secondary: {
        DEFAULT: "var(--color-secondary)",
        on: {
          DEFAULT: "var(--color-secondary-on)",
          alt: "var(--color-secondary-on-alt)",
        },
        variant: {
          DEFAULT: "var(--color-secondary-variant)",
          on: "var(--color-secondary-variant-on)",
        },
      },
      accent: {
        DEFAULT: "var(--color-accent)",
        on: "var(--color-accent-on)",
      },
      background: {
        DEFAULT: "var(--color-background)",
        on: "var(--color-background-on)",
      },
      surface: {
        DEFAULT: "var(--color-surface)",
        on: {
          DEFAULT: "var(--color-surface-on)",
          alt: "var(--color-surface-on-alt)",
        },
      },
      error: {
        DEFAULT: "var(--color-error)",
        on: "var(--color-error-on)",
      },
    },
  },
}


module.exports = config;
