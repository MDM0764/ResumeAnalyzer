import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const initialTheme = localStorage.getItem('theme') || 'light';
document.documentElement.classList.remove('theme-light', 'theme-dark');
document.documentElement.classList.add(`theme-${initialTheme}`);
document.body.classList.remove('theme-light', 'theme-dark');
document.body.classList.add(`theme-${initialTheme}`);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
