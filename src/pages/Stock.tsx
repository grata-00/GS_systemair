import React, { useState, useRef } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ProductCard } from '@/components/ui/ProductCard';
import { StockTable } from '@/components/stock/StockTable';
import { useToast } from '@/hooks/use-toast';
import { ProductService } from '@/lib/indexeddb';
import { Product } from '@/lib/types';
import { useAuth } from '@/components/layout/AuthWrapper';
import { checkPermission } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { Search, AlertTriangle, FileDown, FileUp, Filter, X, Loader2, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const Stock: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStock, setFilterStock] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const canEdit = checkPermission(user, 'stock', 'edit');
  const canDelete = checkPermission(user, 'stock', 'delete');
  
  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: ProductService.getAllProducts,
  });
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStock === 'low') {
      matchesFilter = product.quantity < 5;
    } else if (filterStock === 'out') {
      matchesFilter = product.quantity === 0;
    } else if (filterStock === 'available') {
      matchesFilter = product.quantity > 0;
    }
    
    return matchesSearch && matchesFilter;
  });
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'quantity') {
      return b.quantity - a.quantity;
    } else if (sortBy === 'date') {
      return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
    }
    return 0;
  });
  
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await ProductService.deleteProduct(selectedProduct.id);
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      });
      refetch();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du produit.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };
  
  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!selectedProduct) return;
    
    try {
      const updatedProduct = {
        ...selectedProduct,
        ...productData,
      };
      
      await ProductService.updateProduct(updatedProduct);
      toast({
        title: "Produit mis à jour",
        description: "Le produit a été mis à jour avec succès.",
      });
      setIsEditModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du produit.",
      });
    }
  };
  
  const handleImportProducts = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const importedProducts = JSON.parse(content) as Product[];
        
        if (!Array.isArray(importedProducts)) {
          throw new Error('Format de fichier invalide');
        }
        
        for (const product of importedProducts) {
          if (!product.name || !product.quantity || !product.entryDate) continue;
          
          await ProductService.addProduct({
            name: product.name,
            quantity: product.quantity,
            entryDate: product.entryDate,
            image: product.image,
            barcode: product.barcode,
          });
        }
        
        toast({
          title: "Importation réussie",
          description: `${importedProducts.length} produits ont été importés avec succès.`,
        });
        refetch();
      } catch (error) {
        console.error('Error importing products:', error);
        toast({
          variant: "destructive",
          title: "Erreur d'importation",
          description: "Le fichier sélectionné n'est pas dans un format valide.",
        });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.readAsText(file);
  };
  
  const handleExportProducts = () => {
    setIsExporting(true);
    
    try {
      const exportData = JSON.stringify(products, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `systemair-stock-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Exportation réussie",
        description: "Les données du stock ont été exportées avec succès.",
      });
    } catch (error) {
      console.error('Error exporting products:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'exportation",
        description: "Une erreur est survenue lors de l'exportation des données.",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-secondary/30 animate-fade-in">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Stock</h1>
          <p className="text-muted-foreground">
            Consultez et gérez les produits disponibles dans votre stock.
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="quantity">Quantité</SelectItem>
                  <SelectItem value="date">Date d'ajout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={filterStock}
                onValueChange={setFilterStock}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  <SelectItem value="available">En stock</SelectItem>
                  <SelectItem value="low">Stock faible</SelectItem>
                  <SelectItem value="out">Rupture de stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {sortedProducts.length} produit{sortedProducts.length !== 1 ? 's' : ''} trouvé{sortedProducts.length !== 1 ? 's' : ''}
              </div>
              
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'table')}>
                <ToggleGroupItem value="grid" aria-label="Affichage en grille">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="table" aria-label="Affichage en tableau">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            <div className="flex gap-2 mt-2 sm:mt-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportProducts}
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importation...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Importer
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportProducts}
                disabled={isExporting || products.length === 0}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportation...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exporter
                  </>
                )}
              </Button>
              
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="mr-2 h-4 w-4" />
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-systemair-blue"></div>
            <span className="ml-3 text-lg">Chargement des produits...</span>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStock !== 'all'
                ? "Aucun produit ne correspond à vos critères de recherche."
                : "Votre stock est actuellement vide. Ajoutez des produits pour les voir apparaître ici."}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                <X className="mr-2 h-4 w-4" />
                Effacer la recherche
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={() => handleDeleteProduct(product)}
                canEdit={false}
                canDelete={canDelete}
              />
            ))}
          </div>
        ) : (
          <StockTable
            products={sortedProducts}
            onDelete={handleDeleteProduct}
            canDelete={canDelete}
          />
        )}
      </main>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement le produit "{selectedProduct?.name}" de votre stock.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Systemair. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Stock;
