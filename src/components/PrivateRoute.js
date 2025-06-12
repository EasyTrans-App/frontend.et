// EASYTRANS/frontend/src/components/PrivateRoute.js
import { useAuth } from '../context/authContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, token, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  // Si no hay token, redirigir a login
  if (!token || !user) {
    console.log('🔒 Acceso denegado: No hay token o usuario');
    return <Navigate to="/login" replace />;
  }

  // Si se especificaron roles, verificar que el usuario tenga el rol correcto
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.tipo)) {
    console.log(`🔒 Acceso denegado: Usuario tipo "${user.tipo}" no tiene permisos para roles ${allowedRoles}`);
    return <Navigate to="/" replace />;
  }

  console.log('✅ Acceso permitido para:', user.email, 'Tipo:', user.tipo);
  return children;
};

export default PrivateRoute;