import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css'
import App from './App.tsx'
import './styles/main.scss'
import './App.css'
import './i18n';
import { App as AntApp } from 'antd';
import 'react-confirm-alert/src/react-confirm-alert.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AntApp>
        <App />
      </AntApp>
    </ThemeProvider>
  </StrictMode>,
)
