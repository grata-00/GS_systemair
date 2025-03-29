
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Truck, Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section */}
      <div className="flex-1 bg-gradient-to-r from-systemair-blue/95 to-systemair-lightblue/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="container mx-auto px-4 py-24 flex flex-col items-center relative z-10">
          {/* White logo - updated filter to make it white */}
          <img 
            src="/lovable-uploads/2104008f-299b-4541-8881-afc2928a8372.png" 
            alt="Logo" 
            className="h-24 w-auto mb-8 animate-fade-in brightness-0 invert"
          />
          
          <h1 className="text-5xl md:text-7xl font-bold text-white text-center leading-tight animate-fade-in">
            Gestion de <span className="font-light">Stock</span>
          </h1>
          
          <p className="mt-8 text-xl text-white/90 text-center max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Une solution complète pour gérer votre inventaire, suivre vos livraisons et optimiser votre chaîne d'approvisionnement.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button asChild size="lg" className="rounded-full px-8 btn-hover">
              <Link to="/login">
                Se connecter
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/40 rounded-full px-8 btn-hover">
              <Link to="/register">
                Créer un compte
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 animate-fade-in">
            Fonctionnalités principales
          </h2>
          
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Découvrez les outils qui rendront votre gestion de stock plus efficace et plus simple au quotidien.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/60 animate-scale-in card-hover group">
              <div className="w-16 h-16 rounded-2xl bg-systemair-blue/10 flex items-center justify-center mb-6 group-hover:bg-systemair-blue/20 transition-colors">
                <Package className="h-8 w-8 text-systemair-blue" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Gestion des produits</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">Ajoutez et modifiez vos produits avec toutes les informations nécessaires</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">Gérez les codes-barres pour un suivi efficace</p>
                </div>
              </div>
              <Link to="/login" className="inline-flex items-center text-systemair-blue hover:underline group">
                Commencer
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/60 animate-scale-in card-hover group" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 rounded-2xl bg-systemair-blue/10 flex items-center justify-center mb-6 group-hover:bg-systemair-blue/20 transition-colors">
                <Truck className="h-8 w-8 text-systemair-blue" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Gestion des livraisons</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">Planifiez et suivez toutes vos livraisons en temps réel</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">Coordonnez les responsables commerciaux et logistiques</p>
                </div>
              </div>
              <Link to="/login" className="inline-flex items-center text-systemair-blue hover:underline group">
                Commencer
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/60 animate-scale-in card-hover group" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 rounded-2xl bg-systemair-blue/10 flex items-center justify-center mb-6 group-hover:bg-systemair-blue/20 transition-colors">
                <Layers className="h-8 w-8 text-systemair-blue" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Gestion du stock</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">Consultez votre inventaire en temps réel avec des mises à jour automatiques</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">Analysez les tendances et optimisez vos approvisionnements</p>
                </div>
              </div>
              <Link to="/login" className="inline-flex items-center text-systemair-blue hover:underline group">
                Commencer
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="py-20 bg-gradient-to-r from-gray-50 to-systemair-gray/40">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
            Prêt à optimiser votre gestion de stock ?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Rejoignez-nous aujourd'hui et profitez d'une solution complète adaptée à tous les rôles de votre entreprise.
          </p>
          <Button asChild size="lg" className="rounded-full px-8 animate-fade-in btn-hover" style={{ animationDelay: '0.4s' }}>
            <Link to="/register">
              Commencer maintenant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
