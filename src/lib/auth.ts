
import { UserService } from '../../backend/db';
import { User, UserRole, ROLE_PERMISSIONS } from './types';

// Définir une fonction de délai pour simuler les requêtes réseau
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function login(email: string, password: string): Promise<void> {
  // Simuler un délai de réseau
  await delay(500);

  const user = await UserService.findUserByEmail(email);

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  // Simuler la vérification du mot de passe
  if (email !== 'admin@systemair.com' && password !== 'password') {
    throw new Error('Mot de passe incorrect');
  }

  return;
}

export async function register(
  username: string,
  email: string,
  password: string,
  role: UserRole
): Promise<void> {
  // Simuler un délai de réseau
  await delay(500);
  
  // Vérifier si un utilisateur avec cet email existe déjà
  const existingUser = await UserService.findUserByEmail(email);
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }
  
  // Vérifier si un utilisateur avec ce nom d'utilisateur existe déjà
  const allUsers = await UserService.getAllUsers();
  const userWithSameUsername = allUsers.find(user => user.username === username);
  if (userWithSameUsername) {
    throw new Error('Ce nom d\'utilisateur est déjà utilisé');
  }
  
  // Créer un nouvel utilisateur
  await UserService.addUser({
    username,
    email,
    role,
  });
  
  return;
}

export function logout(): void {
  // Simuler un délai de réseau
  delay(500);
  return;
}

// Fonction de vérification des permissions
export function checkPermission(
  user: User | null, 
  section: keyof typeof ROLE_PERMISSIONS[UserRole], 
  action: 'view' | 'add' | 'edit' | 'delete'
): boolean {
  if (!user) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[user.role];
  if (!permissions) {
    return false;
  }

  return permissions[section]?.[action] || false;
}

// Fonction pour synchroniser les données
export async function syncData(): Promise<void> {
  // Dans un véritable backend, cette fonction se connecterait à un serveur
  // Mais avec IndexedDB, nous pouvons utiliser l'exportation/importation manuelle
  console.log('Synchronisation des données...');
  await delay(1000);
  // Retournons explicitement undefined pour éviter l'erreur TS2322
  return undefined;
}
