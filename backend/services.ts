
import { initDB, STORES, ProductService, DeliveryService, UserService } from './db';

// État des services
const serviceStatus = {
  isInitialized: false,
  lastSyncTimestamp: null as string | null,
};

// Initialisation des services
export async function initServices(): Promise<void> {
  try {
    // S'assurer que la base de données est initialisée
    await initDB();
    
    // Marquer les services comme initialisés
    serviceStatus.isInitialized = true;
    serviceStatus.lastSyncTimestamp = new Date().toISOString();
    
    console.log('Services backend initialisés');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des services:', error);
    throw new Error('Échec de l\'initialisation des services backend');
  }
}

// Vérifier l'état des services
export function getServiceStatus() {
  return {
    ...serviceStatus,
    stores: Object.values(STORES),
  };
}

// Réinitialisation des services (utile pour les tests ou en cas de problème)
export async function resetServices(): Promise<void> {
  try {
    serviceStatus.isInitialized = false;
    serviceStatus.lastSyncTimestamp = null;
    
    // Réinitialiser IndexedDB en supprimant et recréant la base de données
    const db = await initDB();
    db.close();
    
    console.log('Services backend réinitialisés');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des services:', error);
    throw new Error('Échec de la réinitialisation des services backend');
  }
}

// Exporter les services pour qu'ils soient accessibles depuis le frontend
export { ProductService, DeliveryService, UserService };
