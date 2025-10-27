import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue,svelte}',
  ],
  theme: {
    extend: {
      colors: {
        ink:  '#0E1A25', // deep navy
        coal: '#1C1C1E', // charcoal
        paper:'#F5F5F5', // off-white
        flame:'#F26B38', // orange
        tide: '#2BAAA0', // teal
      },
      fontFamily: {
        heading: ['League Spartan', ...fontFamily.sans],
        body: ['Inter', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
