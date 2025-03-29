
// Point d'entrée du backend
import { initServices } from './services';
import { setupSyncService } from './sync';

// Initialisation du backend
export async function initBackend() {
  console.log('Initialisation du backend...');
  
  // Initialiser les services
  await initServices();
  
  // Configurer le service de synchronisation
  setupSyncService();
  
  console.log('Backend initialisé avec succès');
  
  return {
    ready: true,
    timestamp: new Date().toISOString(),
  };
}
