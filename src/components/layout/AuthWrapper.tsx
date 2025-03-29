
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '@/lib/indexeddb';
import { User, UserRole } from '@/lib/types';
import { register as registerUser, login as loginUser } from '@/lib/auth';

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  error: string | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
  loading: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          setLoading(true);
          const user = await UserService.getUserById(userId);
          if (user) {
            setUser(user);
          }
        } catch (error) {
          console.error('Error loading user:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await loginUser(email, password);
      const user = await UserService.findUserByEmail(email);
      if (user) {
        setUser(user);
        localStorage.setItem('userId', user.id);
        navigate('/dashboard');
      } else {
        throw new Error('Erreur lors de la récupération de l\'utilisateur');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de la connexion');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = useCallback(
    async (username: string, email: string, password: string, role: UserRole) => {
      setLoading(true);
      setError(null);
      try {
        await registerUser(username, email, password, role);
        
        // Récupérer l'utilisateur créé
        const user = await UserService.findUserByEmail(email);
        if (user) {
          setUser(user);
          localStorage.setItem('userId', user.id);
          navigate('/dashboard');
        } else {
          throw new Error('Erreur lors de la récupération de l\'utilisateur');
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Une erreur est survenue lors de l\'inscription');
        }
        console.error('Register error:', error);
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('userId');
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export AuthProvider as AuthWrapper pour la compatibilité avec App.tsx
export { AuthProvider as AuthWrapper };
export const useAuth = () => React.useContext(AuthContext);
