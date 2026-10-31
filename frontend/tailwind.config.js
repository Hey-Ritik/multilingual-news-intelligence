/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Swiss International Design System Tokens
        burntOrange: {
          DEFAULT: '#E85D26',
          hover: '#D44F1C',
          active: '#C7471D',
          subtle: '#FDF1EB',
        },
        deepOrange: {
          DEFAULT: '#C7471D',
          hover: '#A93B17',
        },
        warmOrange: {
          DEFAULT: '#F4A261',
          subtle: '#FEF5EE',
        },
        almostBlack: {
          DEFAULT: '#171717',
          pure: '#0B0B0B',
          soft: '#222222',
        },
        pureWhite: '#FFFFFF',
        warmOffWhite: {
          DEFAULT: '#F7F5F0',
          dark: '#EFECE4',
        },
        warmWhite: '#F7F5F0',
        lightGrey: {
          DEFAULT: '#E5E3DE',
          subtle: '#ECEAE5',
          border: '#D8D5CE',
        },
        editorialMuted: {
          DEFAULT: '#6E6B65',
          light: '#8A8780',
          dark: '#4A4843',
        },
        editorialDark: {
          bg: '#171717',
          surface: '#111111',
          elevated: '#1F1F1F',
          border: '#2A2A2A',
          muted: '#8A8780',
          text: '#F7F5F0',
        },
        // Backwards compatibility for existing views
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: [
          'Space Grotesk',
          'Geist Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Geist Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
        editorial: [
          'Space Grotesk',
          'Geist Sans',
          'sans-serif',
        ],
      },
      letterSpacing: {
        'editorial-tighter': '-0.04em',
        'editorial-tight': '-0.02em',
        'editorial-normal': '-0.01em',
        'editorial-wide': '0.12em',
        'editorial-widest': '0.22em',
      },
      lineHeight: {
        'editorial-none': '0.88',
        'editorial-tight': '0.96',
        'editorial-snug': '1.1',
      },
      borderWidth: {
        hairline: '1px',
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '4px',
        full: '9999px',
      },
      boxShadow: {
        'editorial-sm': '0 1px 2px rgba(23, 23, 23, 0.04)',
        'editorial-md': '0 4px 12px rgba(23, 23, 23, 0.06)',
        'editorial-orange': '0 8px 24px rgba(232, 93, 38, 0.2)',
        'dark-hairline': '0 1px 0 0 #2A2A2A',
      },
    },
  },
  plugins: [],
}
