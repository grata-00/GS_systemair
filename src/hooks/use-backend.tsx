
import { useState, useEffect } from 'react';
import { initBackend } from '../../backend';
import { 
  getSyncConfig, 
  performSync, 
  updateSyncConfig, 
  startAutoSync, 
  stopAutoSync 
} from '../../backend/sync';
import { getServiceStatus, resetServices } from '../../backend/services';

// Type pour l'état du backend
interface BackendState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  lastSync: string | null;
  syncConfig: ReturnType<typeof getSyncConfig>;
}

// Hook pour utiliser le backend
export function useBackend() {
  const [state, setState] = useState<BackendState>({
    isInitialized: false,
    isInitializing: true,
    error: null,
    lastSync: null,
    syncConfig: getSyncConfig(),
  });

  // Initialiser le backend au montage du composant
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        await initBackend();
        
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isInitialized: true,
            isInitializing: false,
            lastSync: getSyncConfig().lastSuccessfulSync,
            syncConfig: getSyncConfig(),
          }));
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du backend:', error);
        
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isInitializing: false,
            error: 'Erreur lors de l\'initialisation du backend',
          }));
        }
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchroniser manuellement
  const sync = async () => {
    setState(prev => ({ ...prev, isInitializing: true }));
    
    try {
      const success = await performSync();
      
      setState(prev => ({
        ...prev,
        isInitializing: false,
        lastSync: success ? new Date().toISOString() : prev.lastSync,
        syncConfig: getSyncConfig(),
        error: success ? null : 'Échec de la synchronisation',
      }));
      
      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isInitializing: false,
        error: 'Erreur lors de la synchronisation',
      }));
      
      return false;
    }
  };

  // Mettre à jour la configuration de synchronisation
  const updateConfig = (config: Parameters<typeof updateSyncConfig>[0]) => {
    updateSyncConfig(config);
    setState(prev => ({
      ...prev,
      syncConfig: getSyncConfig(),
    }));
  };

  // Activer la synchronisation automatique
  const enableAutoSync = () => {
    startAutoSync();
    setState(prev => ({
      ...prev,
      syncConfig: getSyncConfig(),
    }));
  };

  // Désactiver la synchronisation automatique
  const disableAutoSync = () => {
    stopAutoSync();
    setState(prev => ({
      ...prev,
      syncConfig: getSyncConfig(),
    }));
  };

  // Réinitialiser les services
  const reset = async () => {
    setState(prev => ({ ...prev, isInitializing: true }));
    
    try {
      await resetServices();
      
      setState(prev => ({
        ...prev,
        isInitializing: false,
        error: null,
      }));
      
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isInitializing: false,
        error: 'Erreur lors de la réinitialisation',
      }));
      
      return false;
    }
  };

  // Obtenir l'état des services
  const getStatus = () => {
    return getServiceStatus();
  };

  return {
    ...state,
    sync,
    updateConfig,
    enableAutoSync,
    disableAutoSync,
    reset,
    getStatus,
  };
}
