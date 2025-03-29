
import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/components/layout/AuthWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserService } from '@/lib/indexeddb';
import { ROLE_PERMISSIONS, PagePermission, User, UserRole } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Shield, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AccessManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<PagePermission | null>(null);
  
  // Récupérer tous les utilisateurs
  const { data: users = [], isLoading, refetch } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: UserService.getAllUsers,
  });
  
  // Filtrer les utilisateurs qui ne sont pas administrateurs
  const nonAdminUsers = users.filter(u => u.role !== 'admin');
  
  // Vérifier si l'utilisateur actuel est administrateur
  const isAdmin = user?.role === 'admin';
  
  const handleSelectUser = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    // Récupérer les permissions par défaut basées sur le rôle
    setUserPermissions({...ROLE_PERMISSIONS[selectedUser.role]});
  };
  
  const handleChangePermission = (page: keyof PagePermission, action: 'view' | 'add' | 'edit' | 'delete', value: boolean) => {
    if (!userPermissions) return;
    
    setUserPermissions(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [page]: {
          ...prev[page],
          [action]: value
        }
      };
    });
  };
  
  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      const userToUpdate = await UserService.getUserById(userId);
      if (userToUpdate) {
        userToUpdate.role = newRole;
        await UserService.updateUser(userToUpdate);
        toast({
          title: "Rôle modifié",
          description: `Le rôle de l'utilisateur a été changé en ${newRole}.`,
        });
        refetch();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du rôle.",
      });
    }
  };
  
  const handleSavePermissions = async () => {
    if (!selectedUser || !userPermissions) return;
    
    try {
      // Dans un système réel, vous enregistreriez ces permissions dans une base de données
      // Ici nous allons simplement simuler une mise à jour réussie
      toast({
        title: "Permissions mises à jour",
        description: `Les permissions pour ${selectedUser.username} ont été mises à jour.`,
      });
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde des permissions.",
      });
    }
  };
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-secondary/30 animate-fade-in">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Accès refusé</AlertTitle>
            <AlertDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              Seuls les administrateurs peuvent gérer les droits d'accès.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-secondary/30 animate-fade-in">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gestion des droits d'accès</h1>
          <p className="text-muted-foreground">
            Configurez les permissions et les rôles des utilisateurs.
          </p>
        </div>
        
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Liste des utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-systemair-blue"></div>
                    <span className="ml-3">Chargement des utilisateurs...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom d'utilisateur</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle actuel</TableHead>
                        <TableHead>Changer le rôle</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}>
                              {user.role === 'admin' ? 'Administrateur' : 
                               user.role === 'commercial' ? 'Commercial' : 'Magasinier'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.role !== 'admin' && (
                              <Select 
                                defaultValue={user.role}
                                onValueChange={(value: UserRole) => handleChangeRole(user.id, value)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="commercial">Commercial</SelectItem>
                                  <SelectItem value="warehouseManager">Magasinier</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSelectUser(user)}
                              disabled={user.role === 'admin'}
                            >
                              Gérer les permissions
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des permissions</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedUser ? (
                  <div className="text-center p-8">
                    <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Aucun utilisateur sélectionné</h3>
                    <p className="text-muted-foreground">
                      Veuillez sélectionner un utilisateur dans l'onglet "Utilisateurs" pour configurer ses permissions.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium">Permissions pour {selectedUser.username}</h3>
                      <p className="text-muted-foreground">
                        Configurez les actions que cet utilisateur peut effectuer dans chaque module.
                      </p>
                    </div>
                    
                    {userPermissions && (
                      <div className="space-y-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Module</TableHead>
                              <TableHead className="text-center">Voir</TableHead>
                              <TableHead className="text-center">Ajouter</TableHead>
                              <TableHead className="text-center">Modifier</TableHead>
                              <TableHead className="text-center">Supprimer</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(Object.keys(userPermissions) as (keyof PagePermission)[]).map((page) => (
                              <TableRow key={page}>
                                <TableCell className="font-medium capitalize">
                                  {page === 'dashboard' ? 'Tableau de bord' : 
                                   page === 'products' ? 'Produits' : 
                                   page === 'delivery' ? 'Livraisons' : 
                                   page === 'stock' ? 'Stock' : 'Paramètres'}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch 
                                    checked={userPermissions[page].view}
                                    onCheckedChange={(checked) => handleChangePermission(page, 'view', checked)}
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch 
                                    checked={userPermissions[page].add}
                                    onCheckedChange={(checked) => handleChangePermission(page, 'add', checked)}
                                    disabled={!userPermissions[page].view}
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch 
                                    checked={userPermissions[page].edit}
                                    onCheckedChange={(checked) => handleChangePermission(page, 'edit', checked)}
                                    disabled={!userPermissions[page].view}
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch 
                                    checked={userPermissions[page].delete}
                                    onCheckedChange={(checked) => handleChangePermission(page, 'delete', checked)}
                                    disabled={!userPermissions[page].view}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        <div className="flex justify-end">
                          <Button onClick={handleSavePermissions}>
                            Enregistrer les permissions
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-6 border-t bg-sky-100">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

// Need to import Badge component
const Badge = ({ variant, className, children }: { variant: string, className: string, children: React.ReactNode }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
};

export default AccessManagement;
