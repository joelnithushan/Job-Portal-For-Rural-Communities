import './i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Default a stable id derived from the message so identical strings dedupe
// instead of stacking when both the axios interceptor and a page catch
// toast the same error.
const stableId = (msg) => `auto:${String(msg ?? '').slice(0, 80)}`;
['error', 'success'].forEach((kind) => {
    const original = toast[kind];
    toast[kind] = (message, opts = {}) =>
        original(message, { id: opts.id ?? stableId(message), ...opts });
});
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { HelmetProvider } from 'react-helmet-async';
import { ChatBubble } from './components/chat/ChatBubble';

import 'leaflet/dist/leaflet.css';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'}>
        <BrowserRouter>
          <AuthProvider>
            <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''}>
              <AppRouter />
              <ChatBubble />
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
    </HelmetProvider>
  </StrictMode>,
)
