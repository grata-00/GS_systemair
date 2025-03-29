
import React from 'react';
import { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, Trash2, Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StockTableProps {
  products: Product[];
  onDelete: (product: Product) => void;
  canDelete: boolean;
}

export const StockTable: React.FC<StockTableProps> = ({
  products,
  onDelete,
  canDelete
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Aucun produit trouvé</h3>
        <p className="text-muted-foreground mb-4">
          Aucun produit ne correspond à vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Code-barres</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Date d'ajout</TableHead>
            <TableHead>Statut</TableHead>
            {canDelete && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="h-14 w-14 rounded-md overflow-hidden border bg-secondary/20">
                  <img 
                    src={product.image || "https://placehold.co/80x80?text=Produit"} 
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                {product.barcode ? (
                  <div className="flex items-center gap-1">
                    <Barcode className="h-4 w-4 text-muted-foreground" />
                    <span>{product.barcode}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Non défini</span>
                )}
              </TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell>
                {new Date(product.entryDate).toLocaleDateString('fr-FR')}
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(product.entryDate), { addSuffix: true, locale: fr })}
                </div>
              </TableCell>
              <TableCell>
                {product.quantity === 0 ? (
                  <Badge variant="destructive">Rupture</Badge>
                ) : product.quantity < 5 ? (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Stock faible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    En stock
                  </Badge>
                )}
              </TableCell>
              {canDelete && (
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(product)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
