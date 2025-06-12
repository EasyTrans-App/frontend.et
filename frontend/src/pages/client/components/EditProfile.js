//EASYTRANS/frontend/src/pages/client/components/EditProfile.js
import React, { useState, useEffect } from 'react';
import useApi from '../../../api/api';

const EditProfile = () => {
  const { get, put } = useApi();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    documento_identidad: '',
    password: '',
    confirmPassword: ''
  });

  const [originalData, setOriginalData] = useState({});

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await get('/users/profile');
      
      if (userData.success) {
        const profileData = {
          nombre: userData.user.nombre || '',
          apellido: userData.user.apellido || '',
          email: userData.user.email || '',
          telefono: userData.user.telefono || '',
          direccion: userData.user.direccion || '',
          documento_identidad: userData.user.documento_identidad || '',
          password: '',
          confirmPassword: ''
        };
        
        setFormData(profileData);
        setOriginalData(profileData);
      } else {
        setMessage({ type: 'error', text: 'Error al cargar los datos del perfil' });
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setMessage({ type: 'error', text: 'Error al cargar los datos del perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar mensaje cuando el usuario empiece a escribir
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.nombre.trim()) {
      errors.push('El nombre es obligatorio');
    }

    if (!formData.apellido.trim()) {
      errors.push('El apellido es obligatorio');
    }

    if (!formData.email.trim()) {
      errors.push('El email es obligatorio');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('El email no es válido');
    }

    if (!formData.telefono.trim()) {
      errors.push('El teléfono es obligatorio');
    }

    if (!formData.documento_identidad.trim()) {
      errors.push('El documento de identidad es obligatorio');
    }

    // Validar contraseña solo si se está cambiando
    if (formData.password) {
      if (formData.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.push('Las contraseñas no coinciden');
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') });
      return;
    }

    try {
      setSaving(true);
      
      // Preparar datos para enviar (sin incluir confirmPassword)
      const dataToSend = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        documento_identidad: formData.documento_identidad
      };

      // Solo incluir password si se está cambiando
      if (formData.password) {
        dataToSend.password = formData.password;
      }

      const response = await put('/users/profile', dataToSend);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
        // Actualizar los datos originales
        setOriginalData({...formData});
        // Limpiar campos de contraseña
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      } else {
        setMessage({ type: 'error', text: response.error || 'Error al actualizar el perfil' });
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({...originalData, password: '', confirmPassword: ''});
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="shipment-card">
        <div className="shipment-card-content">
          <div className="title-shipment">Cargando perfil...</div>
          <div className="info-item">
            <div className="info-icon">⏳</div>
            <div className="info-details">
              <p className="info-label">Estado</p>
              <p className="info-value">Obteniendo información del perfil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shipment-card">
      <div className="shipment-card-content">
        <div className="card-header">
          <h1 className="title-shipment">Editar Perfil</h1>
          <p className="subtitle-shipment">Actualiza tu información personal</p>

          {message.text && (
            <div className={`alert ${message.type}`} style={{ marginTop: '1rem' }}>
              {message.text}
            </div>
          )}
        </div>

        <div className="card-content">
          <form onSubmit={handleSubmit} className="form-grid" style={{ gap: '1.5rem' }}>
            
            {/* Información Personal - Header */}
            <div className="info-item" style={{ 
              flexDirection: 'column', 
              alignItems: 'stretch',
              padding: '1.5rem',
              marginBottom: '1rem',
              minWidth: '40rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="info-icon" style={{ fontSize: '1.5rem' }}>👤</div>
                <h3 className="info-value" style={{ margin: 0, fontSize: '1.2rem' }}>
                  Información Personal
                </h3>
              </div>
              
              {/* Nombre y Apellido */}
              <div className="form-grid" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="nombre" className="info-label">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="form-group input"
                    style={{
                      padding: '0.75rem 1rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(30, 41, 59, 0.5)',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="apellido" className="info-label">Apellido *</label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className="form-group input"
                    style={{
                      padding: '0.75rem 1rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(30, 41, 59, 0.5)',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="email" className="info-label">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-group input"
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(30, 41, 59, 0.5)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>

              {/* Teléfono y Documento */}
              <div className="form-grid" style={{ gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="telefono" className="info-label">Teléfono *</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="form-group input"
                    style={{
                      padding: '0.75rem 1rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(30, 41, 59, 0.5)',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="documento_identidad" className="info-label">Documento de identidad *</label>
                  <input
                    type="text"
                    id="documento_identidad"
                    name="documento_identidad"
                    value={formData.documento_identidad}
                    onChange={handleInputChange}
                    className="form-group input"
                    style={{
                      padding: '0.75rem 1rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(30, 41, 59, 0.5)',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="direccion" className="info-label">Dirección</label>
                <textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  rows="2"
                  className="descripcion_carga"
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
              </div>
            </div>

            {/* Sección de cambio de contraseña */}
            <div className="info-item" style={{ 
              flexDirection: 'column', 
              alignItems: 'stretch',
              padding: '1.5rem',
              minWidth: '40rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="info-icon" style={{ fontSize: '1.5rem' }}>🔒</div>
                <div>
                  <h3 className="info-value" style={{ margin: 0, fontSize: '1.2rem' }}>
                    Cambiar Contraseña
                  </h3>
                  <p className="info-label" style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                    Deja estos campos vacíos si no deseas cambiar tu contraseña
                  </p>
                </div>
              </div>
              
              <div className="form-grid" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="password" className="info-label">Nueva contraseña</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-group input"
                    style={{
                      padding: '0.75rem 1rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(30, 41, 59, 0.5)',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="info-label">Confirmar contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-group input"
                    style={{
                      padding: '0.75rem 1rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(30, 41, 59, 0.5)',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                    minLength="6"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="form-grid" style={{ gap: '1rem', marginTop: '1.5rem', minWidth: '40rem', justifyContent: 'center' }}>
              <button
                type="submit"
                disabled={saving}
                className="action-btn success"
                style={{
                  padding: '1rem 2rem',
                  background: saving 
                    ? 'rgba(107, 114, 128, 0.5)' 
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(34, 197, 94, 0.8))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>
                  {saving ? '⏳' : '💾'}
                </span>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="action-btn warning"
                style={{
                  padding: '1rem 2rem',
                  background: saving 
                    ? 'rgba(107, 114, 128, 0.5)' 
                    : 'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.8))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>↩️</span>
                Cancelar
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;