
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from './AuthWrapper';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-border/40 backdrop-blur-md bg-sky-100 sticky top-0 z-40 animate-fade-in shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/2104008f-299b-4541-8881-afc2928a8372.png" 
              alt="Logo" 
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Menu mobile */}
        <button 
          className="p-2 md:hidden" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Menu desktop */}
        <div className="hidden md:flex items-center gap-6">
          {user && (
            <>
              <nav className="flex items-center gap-6">
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium transition-colors hover:text-systemair-blue relative group"
                >
                  Tableau de bord
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-systemair-blue transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link 
                  to="/stock" 
                  className="text-sm font-medium transition-colors hover:text-systemair-blue relative group"
                >
                  Stock
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-systemair-blue transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link 
                  to="/add-product" 
                  className="text-sm font-medium transition-colors hover:text-systemair-blue relative group"
                >
                  Ajouter produit
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-systemair-blue transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link 
                  to="/delivery" 
                  className="text-sm font-medium transition-colors hover:text-systemair-blue relative group"
                >
                  Livraison
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-systemair-blue transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </nav>

              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 rounded-full px-4 hover:bg-sky-200">
                      <div className="h-8 w-8 rounded-full bg-systemair-blue/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-systemair-blue" />
                      </div>
                      <span className="hidden sm:inline">{user.username}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-lg">
                    <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2">
                      <div className="h-10 w-10 rounded-full bg-systemair-blue/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-systemair-blue" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Paramètres</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer rounded-lg px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>

        {/* Menu mobile overlay avec texte simplifié */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-16 bg-gray-900 text-white z-40 animate-fade-in md:hidden">
            <div className="container py-6 flex flex-col gap-4">
              {user ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Link 
                      to="/dashboard" 
                      className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 flex flex-col items-center justify-center gap-3 shadow-md aspect-square"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="h-12 w-12 rounded-full bg-systemair-blue/20 flex items-center justify-center">
                        <span className="text-white text-2xl">TB</span>
                      </div>
                      <span className="font-medium text-white text-center">Tableau de bord</span>
                    </Link>
                    
                    <Link 
                      to="/stock" 
                      className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 flex flex-col items-center justify-center gap-3 shadow-md aspect-square"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="h-12 w-12 rounded-full bg-systemair-blue/20 flex items-center justify-center">
                        <span className="text-white text-2xl">S</span>
                      </div>
                      <span className="font-medium text-white text-center">Stock</span>
                    </Link>
                    
                    <Link 
                      to="/add-product" 
                      className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 flex flex-col items-center justify-center gap-3 shadow-md aspect-square"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="h-12 w-12 rounded-full bg-systemair-blue/20 flex items-center justify-center">
                        <span className="text-white text-2xl">AP</span>
                      </div>
                      <span className="font-medium text-white text-center">Ajouter produit</span>
                    </Link>
                    
                    <Link 
                      to="/delivery" 
                      className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 flex flex-col items-center justify-center gap-3 shadow-md aspect-square"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="h-12 w-12 rounded-full bg-systemair-blue/20 flex items-center justify-center">
                        <span className="text-white text-2xl">L</span>
                      </div>
                      <span className="font-medium text-white text-center">Livraison</span>
                    </Link>
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="mt-4 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-gray-800 p-4 rounded-xl"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Déconnexion</span>
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to="/login" 
                    className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 flex flex-col items-center justify-center gap-3 shadow-md aspect-square"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="h-12 w-12 rounded-full bg-systemair-blue/20 flex items-center justify-center">
                      <span className="text-white text-2xl">C</span>
                    </div>
                    <span className="font-medium text-white text-center">Connexion</span>
                  </Link>
                  
                  <Link 
                    to="/register" 
                    className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 flex flex-col items-center justify-center gap-3 shadow-md aspect-square"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="h-12 w-12 rounded-full bg-systemair-blue/20 flex items-center justify-center">
                      <span className="text-white text-2xl">I</span>
                    </div>
                    <span className="font-medium text-white text-center">Inscription</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
