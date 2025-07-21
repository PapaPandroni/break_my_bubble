/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Political lean colors
        'strong-left': {
          50: '#e0f2fe',
          100: '#bae6fd',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
        left: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        center: {
          50: '#f9fafb',
          100: '#f3f4f6',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
        },
        right: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        'strong-right': {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#b91c1c',
          600: '#991b1b',
          700: '#7f1d1d',
        },
        undefined: {
          50: '#f9fafb',
          100: '#f3f4f6',
          500: '#d1d5db',
          600: '#9ca3af',
          700: '#6b7280',
        },
      },
    },
  },
  plugins: [],
}

