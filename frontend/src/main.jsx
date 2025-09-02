import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Sidebar from './components/layout/Sidebar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Sidebar />
  </StrictMode>,
)
