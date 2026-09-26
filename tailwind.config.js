/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        privacy: {
          bg: '#F7F8FA',
          card: '#FFFFFF',
          border: '#E5E7EB',
          text: '#1E293B',
          muted: '#64748B',
          emerald: '#10B981',
          shield: '#059669',
          danger: '#DC2626',
          warning: '#D97706',
          accent: '#2563EB',
          indigo: '#4F46E5'
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
