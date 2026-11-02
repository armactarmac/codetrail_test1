import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: '#102742',
        navy: '#081e3a',
        mint: '#c7f4df',
        mintStrong: '#79e0b0',
        cloud: '#f5f7f6',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(9, 44, 77, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
