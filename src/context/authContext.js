// src/context/authContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔄 Intentando login con:', { email: credentials.email });
      
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      const data = await response.json();
      console.log('📦 Datos recibidos:', data);

      if (!response.ok) {
        // Si el servidor responde con error, lanzar excepción con el mensaje
        throw new Error(data.message || data.error || 'Error al iniciar sesión');
      }

      if (data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        
        // Guardar en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Login exitoso:', data.user);
        return data;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔄 Intentando registro con:', userData.email);
      
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('📦 Respuesta de registro:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error al registrar usuario');
      }

      return data;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('👋 Logout exitoso');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};