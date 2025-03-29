import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DeliveryForm } from '@/components/forms/DeliveryForm';
import { DeliveryTable } from '@/components/delivery/DeliveryTable';
import { useToast } from '@/hooks/use-toast';
import { DeliveryService } from '@/lib/indexeddb';
import { Delivery } from '@/lib/types';
import { useAuth } from '@/components/layout/AuthWrapper';
import { checkPermission } from '@/lib/auth';
import { AlertTriangle, Check, Clock, X, Truck, ChevronDown, ChevronUp, Edit, LayoutGrid, List, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const DeliveryPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [openDeliveryIds, setOpenDeliveryIds] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deliveryToDelete, setDeliveryToDelete] = useState<string | null>(null);
  
  const canAddDeliveries = checkPermission(user, 'delivery', 'add');
  const canEditDeliveries = checkPermission(user, 'delivery', 'edit');
  
  const { data: deliveries = [], isLoading, refetch } = useQuery<Delivery[]>({
    queryKey: ['deliveries'],
    queryFn: DeliveryService.getAllDeliveries,
  });
  
  const handleAddDelivery = async (deliveryData: Partial<Delivery>) => {
    if (!canAddDeliveries) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour créer des livraisons.",
      });
      return;
    }
    
    try {
      await DeliveryService.addDelivery(deliveryData as Omit<Delivery, 'id'>);
      toast({
        title: "Livraison créée",
        description: "La livraison a été créée avec succès.",
      });
      refetch();
    } catch (error) {
      console.error('Error adding delivery:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la livraison.",
      });
    }
  };
  
  const handleUpdateDelivery = async (deliveryData: Delivery) => {
    if (!canEditDeliveries) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour modifier des livraisons.",
      });
      return;
    }
    
    try {
      await DeliveryService.updateDelivery(deliveryData);
      toast({
        title: "Livraison modifiée",
        description: "La livraison a été modifiée avec succès.",
      });
      setEditDialogOpen(false);
      setSelectedDelivery(null);
      refetch();
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de la livraison.",
      });
    }
  };
  
  const handleCompleteDelivery = async (id: string) => {
    if (!canEditDeliveries) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour modifier des livraisons.",
      });
      return;
    }
    
    try {
      await DeliveryService.completeDelivery(id);
      toast({
        title: "Livraison terminée",
        description: "La livraison a été marquée comme terminée et le stock a été mis à jour.",
      });
      refetch();
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la livraison.",
      });
    }
  };
  
  const handleCancelDelivery = async (id: string) => {
    if (!canEditDeliveries) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour modifier des livraisons.",
      });
      return;
    }
    
    try {
      const delivery = await DeliveryService.getDeliveryById(id);
      if (delivery) {
        delivery.status = 'cancelled';
        await DeliveryService.updateDelivery(delivery);
        toast({
          title: "Livraison annulée",
          description: "La livraison a été annulée avec succès.",
        });
        refetch();
      }
    } catch (error) {
      console.error('Error cancelling delivery:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation de la livraison.",
      });
    }
  };
  
  const handleDeleteDelivery = async (id: string) => {
    if (!canEditDeliveries) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour supprimer des livraisons.",
      });
      return;
    }
    
    setDeliveryToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteDelivery = async () => {
    if (!deliveryToDelete) return;
    
    try {
      await DeliveryService.deleteDelivery(deliveryToDelete);
      toast({
        title: "Livraison supprimée",
        description: "La livraison a été supprimée avec succès.",
      });
      setDeleteDialogOpen(false);
      setDeliveryToDelete(null);
      refetch();
    } catch (error) {
      console.error('Error deleting delivery:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la livraison.",
      });
    }
  };
  
  const handleEditDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setEditDialogOpen(true);
  };
  
  const toggleDeliveryDetails = (id: string) => {
    setOpenDeliveryIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <Check className="mr-1 h-3 w-3" />
            Terminée
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <X className="mr-1 h-3 w-3" />
            Annulée
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Inconnu
          </Badge>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-secondary/30 animate-fade-in">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gestion des livraisons</h1>
          <p className="text-muted-foreground">
            Créez et suivez les livraisons avec les détails des produits et des responsables.
          </p>
        </div>
        
        {!canAddDeliveries && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Accès limité</AlertTitle>
            <AlertDescription>
              Vous n'avez pas les permissions nécessaires pour créer des livraisons.
              Vous pouvez uniquement consulter les livraisons existantes.
            </AlertDescription>
          </Alert>
        )}
        
        {canAddDeliveries && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Créer une nouvelle livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryForm onSubmit={handleAddDelivery} />
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Livraisons récentes</h2>
            
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'list' | 'table')}>
              <ToggleGroupItem value="list" aria-label="Affichage en liste">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Affichage en tableau">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-systemair-blue"></div>
              <span className="ml-3">Chargement des livraisons...</span>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg border">
              <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucune livraison</h3>
              <p className="text-muted-foreground">
                Aucune livraison n'a été créée pour le moment.
              </p>
              {canAddDeliveries && (
                <Button className="mt-4">
                  Créer une livraison
                </Button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <Collapsible
                  key={delivery.id}
                  open={openDeliveryIds.includes(delivery.id)}
                  onOpenChange={() => toggleDeliveryDetails(delivery.id)}
                  className="border rounded-lg bg-white overflow-hidden transition-all duration-200 animate-scale-in"
                >
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/20">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-systemair-blue mr-3" />
                      <div className="grid">
                        <span className="font-medium">Livraison du {new Date(delivery.date).toLocaleDateString('fr-FR')}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(delivery.date), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(delivery.status)}
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {openDeliveryIds.includes(delivery.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="p-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Commercial</h4>
                          <p>{delivery.commercialManager}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Transporteur</h4>
                          <p>{delivery.logisticsManager}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Client</h4>
                          <p>{delivery.customerName || "Non spécifié"}</p>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mb-2">Produits</h4>
                      <div className="border rounded overflow-hidden mb-4">
                        <div className="grid grid-cols-12 gap-2 p-2 bg-secondary text-xs font-medium">
                          <div className="col-span-8">Produit</div>
                          <div className="col-span-4 text-right">Quantité</div>
                        </div>
                        {delivery.products.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 p-2 border-t text-sm items-center">
                            <div className="col-span-8">{item.productName || `ID: ${item.productId}`}</div>
                            <div className="col-span-4 text-right">{item.quantity}</div>
                          </div>
                        ))}
                      </div>
                      
                      {delivery.status === 'pending' && canEditDeliveries && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => handleCompleteDelivery(delivery.id)}
                            className="flex-1"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Terminer la livraison
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleEditDelivery(delivery)}
                            className="flex-1"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleCancelDelivery(delivery.id)}
                            className="flex-1"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Annuler
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteDelivery(delivery.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          ) : (
            <DeliveryTable
              deliveries={deliveries}
              onComplete={handleCompleteDelivery}
              onEdit={handleEditDelivery}
              onCancel={handleCancelDelivery}
              onDelete={handleDeleteDelivery}
              canEdit={canEditDeliveries}
            />
          )}
        </div>
      </main>
      
      {/* Modal d'édition de livraison */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Modifier la livraison</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedDelivery && (
              <DeliveryForm 
                onSubmit={handleUpdateDelivery} 
                initialData={selectedDelivery} 
                isEditing={true} 
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la livraison</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette livraison ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteDelivery}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <footer className="py-6 border-t bg-sky-100">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default DeliveryPage;
