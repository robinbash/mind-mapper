/** @type {import('tailwindcss').Config} */
const { addIconSelectors } = require('@iconify/tailwind');
const colors = require('tailwindcss/colors')

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      spacing: {
        inset: "env(safe-area-inset-top)"
      }
    },
  },
  plugins: [
    require('daisyui'),
    addIconSelectors(['mdi']),
  ],
  daisyui: {
    themes: [
    "dracula",
    "bumblebee",
      // {
      //   dark: {
      //     ...require("daisyui/src/theming/themes")["dark"],
      //     backgroundColor: colors.slate[800]
      //   },
      //   light: {
      //     ...require("daisyui/src/theming/themes")["light"],
      //     backgroundColor: "white"
      //   },
      // },
    ],

   }
}

