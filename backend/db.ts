import { Product, Delivery, User } from '../src/lib/types';

// Définition de la structure de la base de données
const DB_NAME = 'systemair_db';
const DB_VERSION = 1;
const STORES = {
  users: 'users',
  products: 'products',
  deliveries: 'deliveries',
  //test
};

// Initialisation de la base de données
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening database:', event);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Création des object stores si nécessaire
      if (!db.objectStoreNames.contains(STORES.users)) {
        const usersStore = db.createObjectStore(STORES.users, { keyPath: 'id' });
        usersStore.createIndex('email', 'email', { unique: true });
        usersStore.createIndex('username', 'username', { unique: true });
        usersStore.createIndex('role', 'role', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.products)) {
        const productsStore = db.createObjectStore(STORES.products, { keyPath: 'id' });
        productsStore.createIndex('name', 'name', { unique: false });
        productsStore.createIndex('entryDate', 'entryDate', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.deliveries)) {
        const deliveriesStore = db.createObjectStore(STORES.deliveries, { keyPath: 'id' });
        deliveriesStore.createIndex('date', 'date', { unique: false });
        deliveriesStore.createIndex('status', 'status', { unique: false });
      }

      // Ajouter l'utilisateur admin par défaut
      const transaction = (event.target as IDBOpenDBRequest).transaction;
      if (transaction) {
        const usersStore = transaction.objectStore(STORES.users);
        const adminUser: User = {
          id: '1',
          username: 'admin',
          email: 'admin@systemair.com',
          role: 'admin',
        };

        usersStore.add(adminUser);
      }
    };
  });
}

// Opérations génériques CRUD
async function getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
  const db = await initDB();
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

// Ajouter un élément
export async function add<T>(storeName: string, item: T): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      const store = await getStore(storeName, 'readwrite');
      const request = store.add(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = (event) => {
        console.error(`Error adding item to ${storeName}:`, event);
        reject(`Error adding item to ${storeName}`);
      };
    } catch (error) {
      reject(error);
    }
  });
}

// Mettre à jour un élément
export async function update<T>(storeName: string, item: T): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      const store = await getStore(storeName, 'readwrite');
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = (event) => {
        console.error(`Error updating item in ${storeName}:`, event);
        reject(`Error updating item in ${storeName}`);
      };
    } catch (error) {
      reject(error);
    }
  });
}

// Récupérer un élément par ID
export async function getById<T>(storeName: string, id: string): Promise<T | null> {
  return new Promise(async (resolve, reject) => {
    try {
      const store = await getStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = (event) => {
        console.error(`Error getting item from ${storeName}:`, event);
        reject(`Error getting item from ${storeName}`);
      };
    } catch (error) {
      reject(error);
    }
  });
}

// Récupérer tous les éléments
export async function getAll<T>(storeName: string): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const store = await getStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error(`Error getting all items from ${storeName}:`, event);
        reject(`Error getting all items from ${storeName}`);
      };
    } catch (error) {
      reject(error);
    }
  });
}

// Supprimer un élément
export async function remove(storeName: string, id: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const store = await getStore(storeName, 'readwrite');
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error(`Error deleting item from ${storeName}:`, event);
        reject(`Error deleting item from ${storeName}`);
      };
    } catch (error) {
      reject(error);
    }
  });
}

// Services spécifiques pour les produits
export const ProductService = {
  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const id = crypto.randomUUID();
    const newProduct = { ...product, id };
    return add<Product>(STORES.products, newProduct as Product);
  },

  async updateProduct(product: Product): Promise<Product> {
    return update<Product>(STORES.products, product);
  },

  async getProductById(id: string): Promise<Product | null> {
    return getById<Product>(STORES.products, id);
  },

  async getAllProducts(): Promise<Product[]> {
    return getAll<Product>(STORES.products);
  },

  async deleteProduct(id: string): Promise<void> {
    return remove(STORES.products, id);
  }
};

// Services spécifiques pour les livraisons
export const DeliveryService = {
  async addDelivery(delivery: Omit<Delivery, 'id'>): Promise<Delivery> {
    const id = crypto.randomUUID();
    const newDelivery = { ...delivery, id };
    return add<Delivery>(STORES.deliveries, newDelivery as Delivery);
  },

  async updateDelivery(delivery: Delivery): Promise<Delivery> {
    return update<Delivery>(STORES.deliveries, delivery);
  },

  async getDeliveryById(id: string): Promise<Delivery | null> {
    return getById<Delivery>(STORES.deliveries, id);
  },

  async getAllDeliveries(): Promise<Delivery[]> {
    return getAll<Delivery>(STORES.deliveries);
  },

  async deleteDelivery(id: string): Promise<void> {
    return remove(STORES.deliveries, id);
  },

  async completeDelivery(id: string): Promise<Delivery | null> {
    const delivery = await this.getDeliveryById(id);
    if (!delivery) return null;

    // Mettre à jour le statut de la livraison
    delivery.status = 'completed';
    await this.updateDelivery(delivery);

    // Mettre à jour les quantités en stock
    for (const item of delivery.products) {
      const product = await ProductService.getProductById(item.productId);
      if (product) {
        product.quantity -= item.quantity;
        await ProductService.updateProduct(product);
      }
    }

    return delivery;
  }
};

// Services spécifiques pour les utilisateurs
export const UserService = {
  async addUser(user: Omit<User, 'id'>): Promise<User> {
    const id = crypto.randomUUID();
    const newUser = { ...user, id };
    return add<User>(STORES.users, newUser as User);
  },

  async updateUser(user: User): Promise<User> {
    return update<User>(STORES.users, user);
  },

  async getUserById(id: string): Promise<User | null> {
    return getById<User>(STORES.users, id);
  },

  async getAllUsers(): Promise<User[]> {
    return getAll<User>(STORES.users);
  },

  async findUserByEmail(email: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(user => user.email === email) || null;
  },

  async deleteUser(id: string): Promise<void> {
    return remove(STORES.users, id);
  }
};

// Exporter les constantes pour réutilisation
export { STORES };
