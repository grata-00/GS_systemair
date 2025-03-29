
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { useAuth } from '@/components/layout/AuthWrapper';
import { Package, Truck, Layers, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ProductService, DeliveryService } from '@/lib/indexeddb';
import { Product, Delivery } from '@/lib/types';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { format, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Récupérer les produits
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: ProductService.getAllProducts,
  });
  
  // Récupérer les livraisons
  const { data: deliveries = [], isLoading: isLoadingDeliveries } = useQuery<Delivery[]>({
    queryKey: ['deliveries'],
    queryFn: DeliveryService.getAllDeliveries,
  });
  
  // Calculer les statistiques
  const totalProducts = products.length;
  
  // Calculer le nombre de livraisons ce mois-ci
  const currentMonth = new Date();
  const startOfCurrentMonth = startOfMonth(currentMonth);
  const endOfCurrentMonth = endOfMonth(currentMonth);
  
  const deliveriesThisMonth = deliveries.filter(delivery => {
    const deliveryDate = new Date(delivery.date);
    return deliveryDate >= startOfCurrentMonth && deliveryDate <= endOfCurrentMonth;
  }).length;
  
  // Calculer le nombre de produits ajoutés ce mois-ci
  const productsAddedThisMonth = products.filter(product => {
    const entryDate = new Date(product.entryDate);
    return isSameMonth(entryDate, currentMonth);
  }).length;
  
  return (
    <div className="min-h-screen bg-secondary/30 animate-fade-in">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue, {user?.username} !
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Gestion des produits"
            icon={<Package className="h-5 w-5" />}
            to="/add-product"
          />
          
          <DashboardCard
            title="Gestion des livraisons"
            icon={<Truck className="h-5 w-5" />}
            to="/delivery"
            animate={true}
            className="animate-delay-200"
          />
          
          <DashboardCard
            title="Consultation du stock"
            icon={<Layers className="h-5 w-5" />}
            to="/stock"
            animate={true}
            className="animate-delay-400"
          />
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Aperçu rapide</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg border border-border shadow-sm card-hover">
              <div className="flex items-center mb-2">
                <Package className="h-5 w-5 text-systemair-blue mr-2" />
                <h3 className="font-medium">Total des produits</h3>
              </div>
              <p className="text-3xl font-bold">
                {isLoadingProducts ? "..." : totalProducts}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-border shadow-sm card-hover">
              <div className="flex items-center mb-2">
                <Package className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="font-medium">Produits ajoutés ce mois</h3>
              </div>
              <p className="text-3xl font-bold">
                {isLoadingProducts ? "..." : productsAddedThisMonth}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-border shadow-sm card-hover">
              <div className="flex items-center mb-2">
                <Truck className="h-5 w-5 text-systemair-blue mr-2" />
                <h3 className="font-medium">Livraisons du mois de {format(currentMonth, 'MMMM yyyy')}</h3>
              </div>
              <p className="text-3xl font-bold">
                {isLoadingDeliveries ? "..." : deliveriesThisMonth}
              </p>
            </div>
          </div>
        </div>
        
        {/* Graphique d'analyse */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Analyses</h2>
          
          {isLoadingProducts || isLoadingDeliveries ? (
            <div className="flex justify-center items-center p-8 bg-white rounded-lg border shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-systemair-blue"></div>
              <span className="ml-3">Chargement des données...</span>
            </div>
          ) : (
            <DashboardCharts products={products} deliveries={deliveries} />
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t bg-sky-100">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
