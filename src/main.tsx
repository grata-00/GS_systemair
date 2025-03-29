
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initBackend } from '../backend'

// Initialiser le backend
initBackend().then(() => {
  console.log('Application prête avec backend initialisé');
}).catch(error => {
  console.error('Erreur lors de l\'initialisation du backend:', error);
});

createRoot(document.getElementById("root")!).render(<App />);
