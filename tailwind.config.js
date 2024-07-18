/** @type {import('tailwindcss').Config} */
const { addIconSelectors } = require('@iconify/tailwind');

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    addIconSelectors(['mdi']),
  ],

}

