
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Delivery, Product } from '@/lib/types';

interface DashboardChartsProps {
  products: Product[];
  deliveries: Delivery[];
}

// Fonction pour générer les données mensuelles
const generateMonthlyData = (deliveries: Delivery[], products: Product[]) => {
  const currentDate = new Date();
  const months = [];
  
  // Générer les 6 derniers mois
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(currentDate, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthName = format(monthDate, 'MMM');
    
    // Compter les livraisons du mois
    const monthDeliveries = deliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.date);
      return deliveryDate >= monthStart && deliveryDate <= monthEnd;
    });
    
    // Compter les produits ajoutés ce mois-ci (en utilisant la date d'entrée)
    const monthProducts = products.filter(product => {
      if (!product.entryDate) return false;
      const productDate = new Date(product.entryDate);
      return productDate >= monthStart && productDate <= monthEnd;
    });
    
    months.push({
      name: monthName,
      livraisons: monthDeliveries.length,
      produits: monthProducts.length,
      total_produits: products.length
    });
  }
  
  return months;
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ products, deliveries }) => {
  const monthlyData = generateMonthlyData(deliveries, products);
  
  const chartConfig = {
    livraisons: {
      label: 'Livraisons',
      theme: {
        light: '#0063b9',
        dark: '#004b8d',
      },
    },
    produits: {
      label: 'Produits ajoutés',
      theme: {
        light: '#33C3F0',
        dark: '#1EAEDB',
      },
    },
    total_produits: {
      label: 'Total produits',
      theme: {
        light: '#4caf50',
        dark: '#388e3c',
      },
    },
  };

  return (
    <div className="grid grid-cols-1 gap-6 mb-8 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Activité mensuelle</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ChartContainer config={chartConfig}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="livraisons" name="Livraisons" fill="var(--color-livraisons)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="produits" name="Produits ajoutés" fill="var(--color-produits)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total_produits" name="Total produits" fill="var(--color-total_produits)" radius={[4, 4, 0, 0]} />
              <Legend />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
