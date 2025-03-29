
import React, { useState } from 'react';
import { Delivery, Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, Clock, X, Edit, AlertTriangle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DeliveryTableProps {
  deliveries: Delivery[];
  onComplete: (id: string) => void;
  onEdit: (delivery: Delivery) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

export const DeliveryTable: React.FC<DeliveryTableProps> = ({
  deliveries,
  onComplete,
  onEdit,
  onCancel,
  onDelete,
  canEdit
}) => {
  const [expandedDeliveries, setExpandedDeliveries] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedDeliveries(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  if (deliveries.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Aucune livraison trouvée</h3>
        <p className="text-muted-foreground mb-4">
          Aucune livraison n'a été trouvée dans le système.
        </p>
      </div>
    );
  }

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
    <div className="bg-white rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Commercial</TableHead>
            <TableHead>Transporteur</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Nb produits</TableHead>
            <TableHead>Quantité totale</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((delivery) => (
            <React.Fragment key={delivery.id}>
              <TableRow>
                <TableCell>
                  {new Date(delivery.date).toLocaleDateString('fr-FR')}
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(delivery.date), { addSuffix: true, locale: fr })}
                  </div>
                </TableCell>
                <TableCell>{delivery.commercialManager}</TableCell>
                <TableCell>{delivery.logisticsManager}</TableCell>
                <TableCell>{delivery.customerName || "Non spécifié"}</TableCell>
                <TableCell>{delivery.products.length}</TableCell>
                <TableCell>
                  {delivery.products.reduce((total, product) => total + product.quantity, 0)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {delivery.status === 'pending' && canEdit ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onComplete(delivery.id)}>
                          <Check className="mr-1 h-3 w-3" />
                          Terminer
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onEdit(delivery)}>
                          <Edit className="mr-1 h-3 w-3" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => onCancel(delivery.id)}>
                          <X className="mr-1 h-3 w-3" />
                          Annuler
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDelete(delivery.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Supprimer
                        </Button>
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <div className="text-sm text-muted-foreground">
                          {delivery.status === 'completed' ? 'Livrée' : delivery.status === 'cancelled' ? 'Annulée' : ''}
                        </div>
                        {canEdit && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDelete(delivery.id)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Supprimer
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => toggleExpand(delivery.id)}
                      className="ml-2"
                    >
                      {expandedDeliveries.includes(delivery.id) ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              
              {expandedDeliveries.includes(delivery.id) && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="px-4 py-2 bg-secondary/20 rounded-md">
                      <h4 className="font-medium mb-2">Détails des produits</h4>
                      <div className="grid grid-cols-12 gap-2 p-2 bg-secondary text-xs font-medium rounded-t-md">
                        <div className="col-span-8">Produit</div>
                        <div className="col-span-4 text-right">Quantité</div>
                      </div>
                      <div className="rounded-b-md border border-secondary">
                        {delivery.products.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 p-2 border-t border-secondary text-sm items-center">
                            <div className="col-span-8">
                              {item.productName || `ID: ${item.productId}`}
                            </div>
                            <div className="col-span-4 text-right">{item.quantity}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
