
import { exportAllData, importAllData, downloadExportFile, prepareDataSync } from './sync-utils';

// Configuration pour la synchronisation
type SyncConfig = {
  autoSync: boolean;
  syncInterval: number; // en millisecondes
  lastSyncAttempt: string | null;
  lastSuccessfulSync: string | null;
};

// État par défaut de la configuration
let syncConfig: SyncConfig = {
  autoSync: false,
  syncInterval: 1000 * 60 * 15, // 15 minutes par défaut
  lastSyncAttempt: null,
  lastSuccessfulSync: null,
};

// ID de l'intervalle pour la synchronisation automatique
let syncIntervalId: number | null = null;

// Configurer le service de synchronisation
export function setupSyncService(): void {
  console.log('Configuration du service de synchronisation...');
  
  // Charger la configuration depuis le localStorage si elle existe
  const savedConfig = localStorage.getItem('syncConfig');
  if (savedConfig) {
    try {
      syncConfig = { ...syncConfig, ...JSON.parse(savedConfig) };
      console.log('Configuration de synchronisation chargée:', syncConfig);
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration de synchronisation:', error);
    }
  }
  
  // Configurer la synchronisation automatique si activée
  if (syncConfig.autoSync) {
    startAutoSync();
  }
}

// Démarrer la synchronisation automatique
export function startAutoSync(): void {
  if (syncIntervalId !== null) {
    clearInterval(syncIntervalId);
  }
  
  syncConfig.autoSync = true;
  saveConfig();
  
  syncIntervalId = setInterval(async () => {
    console.log('Synchronisation automatique en cours...');
    await performSync();
  }, syncConfig.syncInterval) as unknown as number;
  
  console.log('Synchronisation automatique activée');
}

// Arrêter la synchronisation automatique
export function stopAutoSync(): void {
  if (syncIntervalId !== null) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
  
  syncConfig.autoSync = false;
  saveConfig();
  
  console.log('Synchronisation automatique désactivée');
}

// Modifier la configuration de synchronisation
export function updateSyncConfig(config: Partial<SyncConfig>): void {
  const oldAutoSync = syncConfig.autoSync;
  const oldInterval = syncConfig.syncInterval;
  
  syncConfig = { ...syncConfig, ...config };
  saveConfig();
  
  // Redémarrer la synchronisation automatique si les paramètres ont changé
  if (syncConfig.autoSync) {
    if (!oldAutoSync || oldInterval !== syncConfig.syncInterval) {
      console.log('Redémarrage de la synchronisation automatique avec les nouveaux paramètres');
      startAutoSync();
    }
  } else if (oldAutoSync) {
    stopAutoSync();
  }
}

// Sauvegarder la configuration dans le localStorage
function saveConfig(): void {
  localStorage.setItem('syncConfig', JSON.stringify(syncConfig));
}

// Effectuer une synchronisation manuelle
export async function performSync(): Promise<boolean> {
  syncConfig.lastSyncAttempt = new Date().toISOString();
  saveConfig();
  
  try {
    // Exporter les données actuelles
    const exportData = await exportAllData();
    console.log('Données exportées avec succès pour synchronisation');
    
    // Dans un vrai système de backend, vous pourriez envoyer les données à un serveur ici
    // et recevoir les données mises à jour du serveur
    
    // Pour cette démonstration, nous simulons juste un délai
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dans un cas réel, nous aurions reçu de nouvelles données du serveur
    // Pour l'instant, nous réimportons simplement les données exportées
    await importAllData(exportData);
    
    // Mettre à jour le statut de synchronisation
    syncConfig.lastSuccessfulSync = new Date().toISOString();
    saveConfig();
    
    console.log('Synchronisation réussie');
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    return false;
  }
}

// Obtenir l'état actuel de la configuration de synchronisation
export function getSyncConfig(): SyncConfig {
  return { ...syncConfig };
}

// Réexporter les fonctions liées à l'exportation/importation pour la synchronisation entre appareils
export { exportAllData, importAllData, downloadExportFile, prepareDataSync };
