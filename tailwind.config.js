/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#DE4444',
          hover: '#C93333',
          active: '#B22828',
          light: '#FDF2F2',
          border: '#F8B4B4',
        },
      },
      spacing: {
        '0.2': '0.05rem',
        '4.5': '1.125rem',
        '8.5': '2.125rem',
        '9.5': '2.375rem',
      },
      borderWidth: {
        '1.5': '1.5px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
