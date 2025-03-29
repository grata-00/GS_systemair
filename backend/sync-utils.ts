
import { ProductService, DeliveryService, UserService } from './db';
import { Product, Delivery, User } from '../src/lib/types';

// Structure pour stocker les données exportées
interface ExportData {
  products: Product[];
  deliveries: Delivery[];
  users: User[];
  timestamp: string;
}

// Exporter toutes les données
export async function exportAllData(): Promise<string> {
  try {
    const products = await ProductService.getAllProducts();
    const deliveries = await DeliveryService.getAllDeliveries();
    const users = await UserService.getAllUsers();
    
    const exportData: ExportData = {
      products,
      deliveries,
      users,
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Erreur lors de l\'exportation des données:', error);
    throw new Error('Échec de l\'exportation des données');
  }
}

// Importer toutes les données
export async function importAllData(jsonData: string): Promise<void> {
  try {
    const data: ExportData = JSON.parse(jsonData);
    
    // Vérifier si les données ont un format valide
    if (!data.products || !data.deliveries || !data.users || !data.timestamp) {
      throw new Error('Format de données non valide');
    }
    
    // Importer les utilisateurs
    for (const user of data.users) {
      try {
        const existingUser = await UserService.getUserById(user.id);
        if (!existingUser) {
          await UserService.updateUser(user);
        }
      } catch {
        // Si l'utilisateur n'existe pas, l'ajouter
        await UserService.addUser(user);
      }
    }
    
    // Importer les produits
    for (const product of data.products) {
      try {
        const existingProduct = await ProductService.getProductById(product.id);
        if (existingProduct) {
          await ProductService.updateProduct(product);
        } else {
          await ProductService.addProduct(product);
        }
      } catch {
        await ProductService.addProduct(product);
      }
    }
    
    // Importer les livraisons
    for (const delivery of data.deliveries) {
      try {
        const existingDelivery = await DeliveryService.getDeliveryById(delivery.id);
        if (existingDelivery) {
          await DeliveryService.updateDelivery(delivery);
        } else {
          await DeliveryService.addDelivery(delivery);
        }
      } catch {
        await DeliveryService.addDelivery(delivery);
      }
    }
    
    return;
  } catch (error) {
    console.error('Erreur lors de l\'importation des données:', error);
    throw new Error('Échec de l\'importation des données');
  }
}

// Générer un fichier d'exportation et le télécharger
export function downloadExportFile(data: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `systemair-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Fonction pour synchroniser les données entre appareils via export/import
export async function prepareDataSync(): Promise<string> {
  const exportData = await exportAllData();
  return exportData;
}
