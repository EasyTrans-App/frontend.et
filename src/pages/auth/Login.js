// EASYTRANS/frontend/src/pages/auth/Login.js
import { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Enviando credenciales:', { email: credentials.email });
      
      const result = await login(credentials);
      console.log('✅ Login exitoso:', result);
      
      // Redirigir según el tipo de usuario
      if (result.user) {
        console.log('🎯 Redirigiendo usuario tipo:', result.user.tipo);
        
        // Normalizar el tipo de usuario a minúsculas para comparación
        const userType = result.user.tipo.toLowerCase();
        
        if (userType === 'cliente' || userType === 'client') {
          console.log('➡️ Redirigiendo a dashboard de cliente');
          navigate('/cliente');
        } else if (userType === 'conductor' || userType === 'driver') {
          console.log('➡️ Redirigiendo a dashboard de conductor');
          navigate('/conductor');
        } else {
          console.log(`➡️ Tipo de usuario desconocido: "${result.user.tipo}", redirigiendo a home`);
          console.log('💡 Tipos válidos: cliente, client, conductor, driver');
          navigate('/');
        }
      } else {
        console.log('➡️ No hay datos de usuario, redirigiendo a home');
        navigate('/');
      }
    } catch (err) {
      console.error('❌ Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>

        {error && (
          <div className="login-error" style={{ 
            color: 'red', 
            marginBottom: '1rem', 
            padding: '0.5rem',
            border: '1px solid red',
            borderRadius: '4px',
            backgroundColor: '#ffe6e6'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="login-footer">
          ¿No tienes una cuenta?{' '}
          <a href="/register">Regístrate</a>
        </p>
      </div>
    </div>
  );
};

export default Login;