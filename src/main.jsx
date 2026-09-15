import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './styles/index.css';
import './config/i18n';
import { store } from './app/store';
import App from './App.jsx';
import Loader from './components/common/Loader.jsx';
import ThemeProvider from './context/ThemeProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <Suspense fallback={<Loader fullscreen />}>
          <App />
        </Suspense>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
