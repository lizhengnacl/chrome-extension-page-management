/** @type {import('tailwindcss').Config} */
import { nextui } from '@nextui-org/react';

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        background: {
          primary: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
          muted: '#94a3b8',
        },
        border: '#475569',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      prefix: 'nextui',
      addCommonColors: true,
      defaultTheme: 'dark',
      defaultExtendTheme: 'dark',
      layout: {
        radius: {
          small: '6px',
          medium: '10px',
          large: '16px',
        },
        borderWidth: {
          small: '1px',
          medium: '1px',
          large: '2px',
        },
      },
      themes: {
        dark: {
          colors: {
            background: '#0f172a',
            foreground: '#f8fafc',
            primary: {
              50: '#eef2ff',
              100: '#e0e7ff',
              200: '#c7d2fe',
              300: '#a5b4fc',
              400: '#818cf8',
              500: '#6366f1',
              600: '#4f46e5',
              700: '#4338ca',
              800: '#3730a3',
              900: '#312e81',
              foreground: '#ffffff',
            },
            secondary: {
              50: '#fdf2f8',
              100: '#fce7f3',
              200: '#fbcfe8',
              300: '#f9a8d4',
              400: '#f472b6',
              500: '#ec4899',
              600: '#db2777',
              700: '#be185d',
              800: '#9d174d',
              900: '#831843',
              foreground: '#ffffff',
            },
            focus: '#6366f1',
            content1: '#1e293b',
            content2: '#334155',
            content3: '#475569',
            content4: '#64748b',
            default: {
              50: '#f8fafc',
              100: '#f1f5f9',
              200: '#e2e8f0',
              300: '#cbd5e1',
              400: '#94a3b8',
              500: '#64748b',
              600: '#475569',
              700: '#334155',
              800: '#1e293b',
              900: '#0f172a',
              foreground: '#f8fafc',
            },
          },
        },
      },
    }),
  ],
}
