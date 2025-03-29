
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { Upload, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(2, { message: 'Le nom du produit doit contenir au moins 2 caractères' }),
  quantity: z.coerce.number().min(0, { message: 'La quantité ne peut pas être négative' }),
  entryDate: z.string().min(1, { message: 'La date d\'entrée est requise' }),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: Partial<Product>) => Promise<void>;
  initialData?: Partial<Product>;
  isEditing?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  initialData = {},
  isEditing = false,
}) => {
  const [image, setImage] = useState<string | null>(initialData.image || null);
  const [barcode, setBarcode] = useState<string | null>(initialData.barcode || null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isBarcodeScanning, setIsBarcodeScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialiser le formulaire avec les valeurs par défaut
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData.name || '',
      quantity: initialData.quantity || 0,
      entryDate: initialData.entryDate || new Date().toISOString().split('T')[0],
    },
  });

  // Gérer le téléchargement d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setIsImageLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Simuler la numérisation d'un code-barres
  const handleBarcodeSimulation = () => {
    setIsBarcodeScanning(true);
    // Simuler un délai pour la numérisation
    setTimeout(() => {
      const randomBarcode = Math.floor(10000000 + Math.random() * 90000000).toString();
      setBarcode(randomBarcode);
      setIsBarcodeScanning(false);
      toast({
        title: "Code-barres capturé",
        description: `Code-barres ${randomBarcode} enregistré avec succès.`,
      });
    }, 1500);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit({ ...values, image, barcode: barcode || undefined });
      
      if (!isEditing) {
        // Réinitialiser le formulaire après soumission pour un nouveau produit
        form.reset();
        setImage(null);
        setBarcode(null);
      }
      
      toast({
        title: isEditing ? "Produit mis à jour" : "Produit ajouté",
        description: isEditing ? "Le produit a été mis à jour avec succès." : "Le produit a été ajouté avec succès au stock.",
      });
    } catch (error) {
      console.error('Error submitting product:', error);
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
    <Card className="p-6 animate-fade-in">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du produit</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le nom du produit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="entryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'entrée</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Image du produit</FormLabel>
              <div className="flex flex-col space-y-4">
                {image && (
                  <div className="relative w-full aspect-video overflow-hidden rounded-md bg-secondary">
                    <img
                      src={image}
                      alt="Aperçu du produit"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setImage(null)}
                    >
                      Supprimer
                    </Button>
                  </div>
                )}
                <div className="flex space-x-2">
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      onChange={handleImageUpload}
                      disabled={isImageLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={isImageLoading}
                    >
                      {isImageLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Télécharger
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>Code-barres</FormLabel>
              <div className="flex items-center space-x-4">
                {barcode ? (
                  <div className="flex-1 p-3 border rounded-md bg-secondary">
                    <p className="font-mono text-sm">{barcode}</p>
                  </div>
                ) : (
                  <div className="flex-1 p-3 border rounded-md bg-secondary text-muted-foreground">
                    <p className="text-sm">Pas de code-barres</p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBarcodeSimulation}
                  disabled={isBarcodeScanning}
                >
                  {isBarcodeScanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Numérisation...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Scanner
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Mise à jour..." : "Ajout en cours..."}
              </>
            ) : (
              <>{isEditing ? "Mettre à jour le produit" : "Ajouter au stock"}</>
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
};
