
// This file serves as an adapter to access backend sync functions from the frontend
import { 
  setupSyncService, 
  startAutoSync, 
  stopAutoSync, 
  updateSyncConfig, 
  performSync, 
  getSyncConfig,
  exportAllData,
  importAllData,
  downloadExportFile,
  prepareDataSync 
} from '../../backend/sync';

// Re-export sync functions
export { 
  setupSyncService, 
  startAutoSync, 
  stopAutoSync, 
  updateSyncConfig, 
  performSync, 
  getSyncConfig,
  exportAllData,
  importAllData,
  downloadExportFile,
  prepareDataSync
};
