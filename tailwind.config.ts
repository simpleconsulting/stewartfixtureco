import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        navy: '#14213D',
        gold: '#FCA311',
        light: '#E5E5E5',
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
};

export default config; 