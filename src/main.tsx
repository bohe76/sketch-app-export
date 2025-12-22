import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/app/App'
import './styles/main.css';

console.log("🚀 Main.tsx executing...");

const root = document.getElementById('root');
console.log("Root element:", root);

if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
} else {
    console.error("❌ Root element not found!");
}
