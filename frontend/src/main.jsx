import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes';
import { store } from './store/store';
import ErrorBoundary from './components/ErrorBoundary';
import SyncStatusBadge from './components/SyncStatusBadge';
import useOfflineSync from './hooks/useOfflineSync';
import './styles/globals.css';

// Register service worker for PWA in production; unregister in development to avoid breaking Vite HMR
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}

function Main() {
  useOfflineSync();
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppRoutes />
        <div className="fixed bottom-4 right-4 z-50">
          <SyncStatusBadge />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Provider>
    </ErrorBoundary>
  );
}

export default Main;
