import { useState, useEffect } from 'react';
import { authService } from '../lib/auth';

interface User {
  id: string;
  email: string;
  name?: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      // In production, fetch user data from API
      setUser({ id: '1', email: 'user@example.com', name: 'User' });
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
    setIsAuthenticated(true);
    setUser({ id: '1', email, name: 'User' });
  };

  const register = async (email: string, password: string) => {
    await authService.register(email, password);
    setIsAuthenticated(true);
    setUser({ id: '1', email, name: 'User' });
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return { 
    isAuthenticated, 
    isLoading, 
    user, 
    loading: isLoading,
    login, 
    register, 
    logout 
  };
}
