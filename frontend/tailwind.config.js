/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#000000', // True black
                    card: '#120505', // Slightly reddish black
                    border: '#331111', // Reddish border
                    text: '#ffffff',
                    accent: '#ff4d00' // Hot Orange/Red
                },
                light: {
                    bg: '#fff7ed', // Warm white
                    card: '#ffffff',
                    text: '#111827',
                    accent: '#ea580c' // Orange-600
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
