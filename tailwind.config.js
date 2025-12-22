/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#27272a', // zinc-800
                secondary: '#0095F6',
                danger: '#FF3040',
                background: '#FFFFFF',
                surface: '#F5F5F5',
                border: '#E5E5E5',
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
            },
            boxShadow: {
                soft: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
