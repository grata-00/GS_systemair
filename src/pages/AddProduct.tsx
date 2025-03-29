import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ProductForm } from '@/components/forms/ProductForm';
import { useToast } from '@/hooks/use-toast';
import { ProductService } from '@/lib/indexeddb';
import { Product } from '@/lib/types';
import { useAuth } from '@/components/layout/AuthWrapper';
import { checkPermission } from '@/lib/auth';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AddProduct: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const canAddProducts = checkPermission(user, 'products', 'add');
  
  const handleAddProduct = async (productData: Partial<Product>) => {
    if (!canAddProducts) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour ajouter des produits.",
      });
      return;
    }
    
    try {
      await ProductService.addProduct(productData as Omit<Product, 'id'>);
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès au stock.",
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du produit.",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-secondary/30 animate-fade-in">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Ajouter un produit</h1>
          <p className="text-muted-foreground">
            Ajoutez un nouveau produit à votre catalogue et au stock.
          </p>
        </div>
        
        {!canAddProducts ? (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Accès refusé</AlertTitle>
            <AlertDescription>
              Vous n'avez pas les permissions nécessaires pour ajouter des produits.
              Contactez un administrateur pour obtenir les accès.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="max-w-2xl mx-auto">
            <ProductForm onSubmit={handleAddProduct} />
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

export default AddProduct;
