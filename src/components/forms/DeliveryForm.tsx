
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Delivery, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash } from 'lucide-react';
import { ProductService } from '@/lib/indexeddb';

const deliverySchema = z.object({
  commercialManager: z.string().min(2, { message: 'Le nom du commercial est requis' }),
  logisticsManager: z.string().min(2, { message: 'Le nom du transporteur est requis' }),
  customerName: z.string().optional(),
  date: z.string().min(1, { message: 'La date de livraison est requise' }),
});

type DeliveryFormValues = z.infer<typeof deliverySchema>;

// Type pour les produits sélectionnés dans la livraison
interface SelectedProduct {
  productId: string;
  name: string;
  quantity: number;
  availableQuantity: number;
}

interface DeliveryFormProps {
  onSubmit: (data: Partial<Delivery>) => Promise<void>;
  initialData?: Partial<Delivery>;
  isEditing?: boolean;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  onSubmit,
  initialData = {},
  isEditing = false,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Charger la liste des produits
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await ProductService.getAllProducts();
        setProducts(allProducts);
        
        // Si en mode édition, initialiser les produits sélectionnés
        if (isEditing && initialData.products) {
          const selected = initialData.products.map((item) => {
            const product = allProducts.find(p => p.id === item.productId);
            return {
              productId: item.productId,
              name: product?.name || 'Produit inconnu',
              quantity: item.quantity,
              availableQuantity: product?.quantity || 0,
            };
          });
          setSelectedProducts(selected);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger la liste des produits.",
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    loadProducts();
  }, [isEditing, initialData.products, toast]);

  // Initialiser le formulaire avec les valeurs par défaut
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      commercialManager: initialData.commercialManager || '',
      logisticsManager: initialData.logisticsManager || '',
      customerName: initialData.customerName || '',
      date: initialData.date || new Date().toISOString().split('T')[0],
    },
  });

  // Ajouter un produit à la livraison
  const addProduct = () => {
    if (!currentProduct) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un produit.",
      });
      return;
    }

    if (currentQuantity <= 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "La quantité doit être positive.",
      });
      return;
    }

    const product = products.find(p => p.id === currentProduct);
    if (!product) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Produit non trouvé.",
      });
      return;
    }

    if (currentQuantity > product.quantity) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Quantité supérieure au stock disponible.",
      });
      return;
    }

    // Vérifier si le produit est déjà dans la liste
    const existingIndex = selectedProducts.findIndex(p => p.productId === currentProduct);
    if (existingIndex !== -1) {
      // Mettre à jour la quantité si le produit existe déjà
      const updatedProducts = [...selectedProducts];
      const newQuantity = updatedProducts[existingIndex].quantity + currentQuantity;
      
      if (newQuantity > product.quantity) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Quantité totale supérieure au stock disponible.",
        });
        return;
      }
      
      updatedProducts[existingIndex].quantity = newQuantity;
      setSelectedProducts(updatedProducts);
    } else {
      // Ajouter un nouveau produit
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: product.id,
          name: product.name,
          quantity: currentQuantity,
          availableQuantity: product.quantity,
        },
      ]);
    }

    // Réinitialiser les champs
    setCurrentProduct('');
    setCurrentQuantity(1);

    toast({
      title: "Produit ajouté",
      description: `${product.name} ajouté à la livraison.`,
    });
  };

  // Supprimer un produit de la livraison
  const removeProduct = (index: number) => {
    const newSelectedProducts = [...selectedProducts];
    newSelectedProducts.splice(index, 1);
    setSelectedProducts(newSelectedProducts);
  };

  // Soumettre le formulaire
  const handleSubmit = async (values: DeliveryFormValues) => {
    if (selectedProducts.length === 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit à la livraison.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const deliveryData: Partial<Delivery> = {
        ...values,
        status: 'pending', // Statut par défaut
        products: selectedProducts.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          productName: p.name, // Include product name in the delivery data
        })),
      };

      await onSubmit(deliveryData);
      
      if (!isEditing) {
        // Réinitialiser le formulaire après soumission pour une nouvelle livraison
        form.reset();
        setSelectedProducts([]);
      }
      
      toast({
        title: isEditing ? "Livraison mise à jour" : "Livraison créée",
        description: isEditing ? "La livraison a été mise à jour avec succès." : "La livraison a été créée avec succès.",
      });
    } catch (error) {
      console.error('Error submitting delivery:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="commercialManager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commercial</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du commercial" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logisticsManager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transporteur</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du transporteur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du client</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du client (optionnel)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de livraison</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Produits à livrer</h3>
              
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <FormLabel htmlFor="product">Produit</FormLabel>
                    <select
                      id="product"
                      value={currentProduct}
                      onChange={(e) => setCurrentProduct(e.target.value)}
                      disabled={isLoadingProducts}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Sélectionner un produit</option>
                      {products.map((product) => (
                        <option 
                          key={product.id} 
                          value={product.id}
                          disabled={product.quantity <= 0}
                        >
                          {product.name} ({product.quantity} disponibles)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <FormLabel htmlFor="quantity">Quantité</FormLabel>
                    <div className="flex space-x-2">
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={currentQuantity}
                        onChange={(e) => setCurrentQuantity(parseInt(e.target.value) || 0)}
                        disabled={!currentProduct || isLoadingProducts}
                      />
                      <Button
                        type="button"
                        onClick={addProduct}
                        disabled={!currentProduct || isLoadingProducts}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {isLoadingProducts && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Chargement des produits...</span>
                  </div>
                )}
              </div>
              
              {selectedProducts.length > 0 ? (
                <div className="space-y-2">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-2 p-3 font-medium bg-secondary text-secondary-foreground">
                      <div className="col-span-5">Produit</div>
                      <div className="col-span-3">Quantité</div>
                      <div className="col-span-3">Disponible</div>
                      <div className="col-span-1"></div>
                    </div>
                    {selectedProducts.map((product, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 p-3 border-t items-center">
                        <div className="col-span-5">{product.name}</div>
                        <div className="col-span-3">{product.quantity}</div>
                        <div className="col-span-3">{product.availableQuantity}</div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => removeProduct(index)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 border rounded-md bg-secondary/50">
                  <p className="text-muted-foreground">Aucun produit ajouté à cette livraison</p>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Mise à jour..." : "Création en cours..."}
                </>
              ) : (
                <>{isEditing ? "Mettre à jour la livraison" : "Créer la livraison"}</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
