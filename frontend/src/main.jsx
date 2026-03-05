import './i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';

// Add leaflet CSS natively
import 'leaflet/dist/leaflet.css';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: '12px'
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
