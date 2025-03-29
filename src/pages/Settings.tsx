import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/layout/AuthWrapper';
import { checkPermission } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload, RefreshCw, Settings as SettingsIcon, Database, Info } from 'lucide-react';
import { 
  setupSyncService, 
  startAutoSync, 
  stopAutoSync, 
  updateSyncConfig, 
  performSync, 
  getSyncConfig,
  exportAllData,
  importAllData,
  downloadExportFile
} from '@/lib/sync';
import { getServiceStatus, resetServices } from '@/lib/indexeddb';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { STORES } from '../../backend/db';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(15);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<string | null>(null);
  const [lastSuccessfulSync, setLastSuccessfulSync] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState({ isInitialized: false, lastSyncTimestamp: null as string | null, stores: [] as string[] });
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Vérifier les permissions
  const canViewSettings = checkPermission(user, 'settings', 'view');
  const canEditSettings = checkPermission(user, 'settings', 'edit');
  
  useEffect(() => {
    // Charger la configuration de synchronisation au montage du composant
    const syncConfig = getSyncConfig();
    setAutoSync(syncConfig.autoSync);
    setSyncInterval(syncConfig.syncInterval / (1000 * 60));
    setLastSyncAttempt(syncConfig.lastSyncAttempt);
    setLastSuccessfulSync(syncConfig.lastSuccessfulSync);
    
    // Charger l'état des services
    const status = getServiceStatus();
    setServiceStatus(status);
  }, []);
  
  const handleAutoSyncToggle = (checked: boolean) => {
    if (!canEditSettings) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour modifier les paramètres.",
      });
      return;
    }
    
    setAutoSync(checked);
    if (checked) {
      startAutoSync();
    } else {
      stopAutoSync();
    }
    
    updateSyncConfig({ autoSync: checked });
    
    toast({
      title: "Paramètres mis à jour",
      description: `La synchronisation automatique a été ${checked ? 'activée' : 'désactivée'}.`,
    });
  };
  
  const handleSyncIntervalChange = (interval: number) => {
    if (!canEditSettings) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour modifier les paramètres.",
      });
      return;
    }
    
    setSyncInterval(interval);
    updateSyncConfig({ syncInterval: interval * 60 * 1000 });
    
    toast({
      title: "Paramètres mis à jour",
      description: `L'intervalle de synchronisation a été mis à jour à ${interval} minutes.`,
    });
  };
  
  const handleManualSync = async () => {
    if (!canEditSettings) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour synchroniser les données.",
      });
      return;
    }
    
    const success = await performSync();
    setLastSyncAttempt(getSyncConfig().lastSyncAttempt);
    setLastSuccessfulSync(getSyncConfig().lastSuccessfulSync);
    
    if (success) {
      toast({
        title: "Synchronisation réussie",
        description: "Les données ont été synchronisées avec succès.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur de synchronisation",
        description: "Une erreur est survenue lors de la synchronisation des données.",
      });
    }
  };
  
  const handleResetServices = async () => {
    if (!canEditSettings) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour réinitialiser les services.",
      });
      return;
    }
    
    setIsResetting(true);
    try {
      await resetServices();
      toast({
        title: "Services réinitialisés",
        description: "Les services backend ont été réinitialisés avec succès.",
      });
      
      // Recharger l'état des services
      const status = getServiceStatus();
      setServiceStatus(status);
    } catch (error) {
      console.error('Error resetting services:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la réinitialisation des services.",
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  const handleExportData = async () => {
    if (!canEditSettings) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour exporter les données.",
      });
      return;
    }
    
    setIsExporting(true);
    try {
      const exportData = await exportAllData();
      downloadExportFile(exportData);
      
      toast({
        title: "Exportation réussie",
        description: "Les données ont été exportées avec succès.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'exportation",
        description: "Une erreur est survenue lors de l'exportation des données.",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImportClick = () => {
    if (!canEditSettings) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour importer des données.",
      });
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const jsonData = e.target?.result as string;
          await importAllData(jsonData);
          
          // Recharger l'état des services
          const status = getServiceStatus();
          setServiceStatus(status);
          
          toast({
            title: "Importation réussie",
            description: "Les données ont été importées avec succès.",
          });
        } catch (error) {
          console.error('Error processing import data:', error);
          toast({
            variant: "destructive",
            title: "Erreur d'importation",
            description: "Le fichier d'importation n'est pas valide.",
          });
        } finally {
          setIsImporting(false);
          // Réinitialiser le champ de fichier
          if (event.target) {
            event.target.value = '';
          }
        }
      };
      
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Erreur de lecture",
          description: "Impossible de lire le fichier.",
        });
        setIsImporting(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'importation",
        description: "Une erreur est survenue lors de l'importation des données.",
      });
      setIsImporting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-secondary/30 animate-fade-in">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Configurez les paramètres de votre application.
          </p>
        </div>
        
        {!canViewSettings && (
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>Accès refusé</AlertTitle>
            <AlertDescription>
              Vous n'avez pas les permissions nécessaires pour consulter les paramètres.
            </AlertDescription>
          </Alert>
        )}
        
        {canViewSettings && (
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Synchronisation des données</CardTitle>
                <CardDescription>
                  Configurez la synchronisation automatique des données.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">
                      Synchronisation automatique
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Activez ou désactivez la synchronisation automatique des données.
                    </p>
                  </div>
                  <Switch
                    id="auto-sync"
                    checked={autoSync}
                    onCheckedChange={handleAutoSyncToggle}
                    disabled={!canEditSettings}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Intervalle de synchronisation (en minutes)</Label>
                  <Select
                    value={String(syncInterval)}
                    onValueChange={(value) => handleSyncIntervalChange(Number(value))}
                    disabled={!canEditSettings}
                  >
                    <SelectTrigger id="sync-interval">
                      <SelectValue placeholder="Sélectionner un intervalle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium leading-none">Dernière tentative de synchronisation</p>
                    <p className="text-sm text-muted-foreground">
                      {lastSyncAttempt ? new Date(lastSyncAttempt).toLocaleString() : 'Jamais'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">Dernière synchronisation réussie</p>
                    <p className="text-sm text-muted-foreground">
                      {lastSuccessfulSync ? new Date(lastSuccessfulSync).toLocaleString() : 'Jamais'}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleManualSync} disabled={!canEditSettings}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Synchroniser maintenant
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Transfert de données entre appareils</CardTitle>
                <CardDescription>
                  Exportez ou importez des données pour synchroniser plusieurs tablettes.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-none">Exportation des données</p>
                  <p className="text-sm text-muted-foreground">
                    Exportez toutes les données sous forme de fichier JSON que vous pourrez transférer vers d'autres tablettes.
                  </p>
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-none">Importation des données</p>
                  <p className="text-sm text-muted-foreground">
                    Importez des données à partir d'un fichier JSON exporté depuis une autre tablette.
                    <br />
                    <span className="font-semibold">Note:</span> Cette action fusionnera les données avec celles existantes.
                  </p>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".json" 
                  className="hidden" 
                />
              </CardContent>
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleExportData}
                    disabled={isExporting || !canEditSettings}
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Exportation...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Exporter les données
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleImportClick}
                    disabled={isImporting || !canEditSettings}
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Importation...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Importer des données
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Gestion des données</CardTitle>
                <CardDescription>
                  Réinitialisez ou exportez vos données.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-none">Réinitialiser les services</p>
                  <p className="text-sm text-muted-foreground">
                    Réinitialisez tous les services backend à leur état initial.
                    <br />
                    <span className="font-semibold">Attention:</span> cette action est irréversible et supprimera toutes les données.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  onClick={handleResetServices}
                  disabled={isResetting || !canEditSettings}
                >
                  {isResetting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Réinitialisation...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Réinitialiser les services
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Informations sur le système</CardTitle>
                <CardDescription>
                  État des services et des magasins de données.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-none">État des services</p>
                  <p className="text-sm text-muted-foreground">
                    {serviceStatus.isInitialized ? 'Initialisés' : 'Non initialisés'}
                  </p>
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-none">Dernière synchronisation</p>
                  <p className="text-sm text-muted-foreground">
                    {serviceStatus.lastSyncTimestamp ? new Date(serviceStatus.lastSyncTimestamp).toLocaleString() : 'Jamais'}
                  </p>
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-none">Magasins de données</p>
                  <ul className="list-disc pl-5">
                    {serviceStatus.stores.map((store) => (
                      <li key={store} className="text-sm text-muted-foreground">
                        {store}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" disabled>
                  <Info className="mr-2 h-4 w-4" />
                  Plus d'informations
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Systemair. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Settings;
