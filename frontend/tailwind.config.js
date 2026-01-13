/** @type {import('tailwindcss').Config} */
import headlessui from '@headlessui/tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // UAE-friendly palette
        'desert': {
          50: '#FEFDF9',
          100: '#FDF9F0',
          200: '#F8F1E4',
          300: '#F3E8D5',
          400: '#EEDBC0',
          500: '#E6CDA6',
          600: '#D4B684',
          700: '#BF9B5F',
          800: '#A8803C',
          900: '#8B6B1F'
        },
        'emerald': {
          50: '#F0FDF9',
          100: '#CCFDF2',
          200: '#99F9E6',
          300: '#5FEBD3',
          400: '#22D3AA',
          500: '#006C57',
          600: '#005C4A',
          700: '#004D3E',
          800: '#003F33',
          900: '#00332A'
        },
        'charcoal': {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        },
        'gold': {
          50: '#FEFDFB',
          100: '#FDF9F2',
          200: '#F8F1E0',
          300: '#F2E6C8',
          400: '#E8D5A3',
          500: '#C8A75C',
          600: '#B59943',
          700: '#9D8635',
          800: '#82712B',
          900: '#6B5D24'
        },
        'off-white': '#F8FAFC'
      },
      fontFamily: {
        'sans': ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        'display': ['Manrope', 'Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem'
      },
      minHeight: {
        'touch': '44px' // Minimum touch target size
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 16px -6px rgba(0, 0, 0, 0.08)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevated': '0 4px 16px -4px rgba(0, 0, 0, 0.12), 0 2px 8px -2px rgba(0, 0, 0, 0.08)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [
    headlessui
  ]
}
