
import React from 'react';
import { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete,
  canEdit,
  canDelete
}) => {
  const { id, name, quantity, entryDate, image, barcode } = product;
  
  const defaultImage = "https://placehold.co/200x150?text=Pas+d'image";
  
  const timeAgo = formatDistanceToNow(new Date(entryDate), { 
    addSuffix: true,
    locale: fr
  });

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-scale-in">
      <div className="aspect-video w-full overflow-hidden bg-secondary">
        <img
          src={image || defaultImage}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold line-clamp-1">{name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            quantity > 10 ? 'bg-green-100 text-green-800' : 
            quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {quantity} en stock
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <BarChart3 className="mr-1 h-4 w-4" />
          {barcode ? 
            <span>Code-barres: {barcode}</span> : 
            <span>Pas de code-barres</span>
          }
        </div>
        <p className="text-sm text-muted-foreground">Ajouté {timeAgo}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        {canEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 mr-2"
            onClick={() => onEdit && onEdit(product)}
          >
            <Edit className="mr-1 h-4 w-4" />
            Modifier
          </Button>
        )}
        {canDelete && (
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex-1"
            onClick={() => onDelete && onDelete(id)}
          >
            <Trash className="mr-1 h-4 w-4" />
            Supprimer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
