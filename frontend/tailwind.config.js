/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#FAFAF8',
        'bg-surface': '#FFFFFF',
        'bg-deep': '#10322E',
        'brand-primary': '#1D9E75',
        'brand-secondary': '#0F766E',
        'brand-glow': '#78D3BC',
        'accent-gold': '#E6A817',
        'accent-amber': '#E6A817',
        'text-primary': '#18322D',
        'text-secondary': '#4A5E59',
        'text-muted': '#8FA49E',
        'text-inverse': '#FAFAF8',
        'status-normal': '#1D9E75',
        'status-warning': '#E6A817',
        'status-critical': '#E84040',
        'status-info': '#5A8FA8',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.4' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }],
        md: ['1.125rem', { lineHeight: '1.7' }],
        lg: ['1.25rem', { lineHeight: '1.6' }],
        xl: ['1.5rem', { lineHeight: '1.4' }],
        '2xl': ['2rem', { lineHeight: '1.2' }],
        '3xl': ['2.75rem', { lineHeight: '1.15' }],
        '4xl': ['3.5rem', { lineHeight: '1.1' }],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
        xl: '28px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 10px 30px rgba(24, 50, 45, 0.07)',
        elevated: '0 16px 40px rgba(16, 50, 46, 0.12)',
        glow: '0 0 0 4px rgba(120, 211, 188, 0.2)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '280ms',
        slow: '480ms',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        breathe: 'breathe 3s ease-in-out infinite',
        'pulse-once': 'pulse-once 1.5s ease-out 0.3s 1',
        'slide-up': 'slideUp 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'fade-in': 'fadeIn 0.28s ease both',
        'bounce-dot': 'bounce-dot 1.2s ease-in-out infinite',
        blob: 'blob 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(-6px)' },
          '50%': { transform: 'translateY(6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'pulse-once': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-6px)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(20px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-10px, 10px) scale(0.97)' },
        },
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
}
