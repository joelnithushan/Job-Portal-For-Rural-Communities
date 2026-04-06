import './i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Add leaflet CSS natively
import 'leaflet/dist/leaflet.css';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'}>
      <BrowserRouter>
        <AuthProvider>
          <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''}>
            <AppRouter />
          </GoogleReCaptchaProvider>
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
    </GoogleOAuthProvider>
  </StrictMode>,
)
