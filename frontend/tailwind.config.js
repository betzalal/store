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
                    bg: '#0f172a', // Slate 900
                    card: '#1e293b', // Slate 800
                    border: '#334155', // Slate 700
                    text: '#f8fafc', // Slate 50
                    accent: '#3b82f6' // Blue 500
                },
                light: {
                    bg: '#e2e8f0', // Slate 200 (Visibly grayer background)
                    card: '#f8fafc', // Slate 50 (Slightly off-white card)
                    text: '#0f172a', // Slate 900
                    border: '#cbd5e1', // Slate 300
                    accent: '#2563eb' // Blue 600
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
