//EASYTRANS/frontend/src/pages/driver/components/MyServicesCard.js
import { useState, useEffect } from 'react';
import driverService from '../../../services/driverService';

const MyServicesCard = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyServices();

    // Escuchar eventos de servicios aceptados
    const handleServiceAccepted = (event) => {
      console.log('Servicio aceptado detectado:', event.detail.serviceId);
      // Recargar los servicios cuando se acepta uno nuevo
      fetchMyServices();
    };

    // Escuchar eventos de actualización de estado
    const handleServiceStatusUpdated = (event) => {
      console.log('Estado de servicio actualizado:', event.detail);
      // Recargar los servicios cuando se actualiza el estado
      fetchMyServices();
    };

    window.addEventListener('serviceAccepted', handleServiceAccepted);
    window.addEventListener('serviceStatusUpdated', handleServiceStatusUpdated);

    // Cleanup
    return () => {
      window.removeEventListener('serviceAccepted', handleServiceAccepted);
      window.removeEventListener('serviceStatusUpdated', handleServiceStatusUpdated);
    };
  }, []);

  const fetchMyServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await driverService.getMyServices();
      const mappedData = driverService.mapServiceData(data);
      
      setServices(mappedData);
    } catch (error) {
      console.error('Error fetching my services:', error);
      setError(error.message || 'Error al cargar mis servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleStartService = async (serviceId) => {
    try {
      if (window.confirm('¿Estás listo para iniciar este servicio?')) {
        await driverService.startService(serviceId);
        
        // Emitir evento de actualización de estado
        const event = new CustomEvent('serviceStatusUpdated', {
          detail: { serviceId, newStatus: 'en_proceso' }
        });
        window.dispatchEvent(event);
        
        alert('✅ Servicio iniciado correctamente');
        fetchMyServices(); // Actualizar la lista
      }
    } catch (error) {
      console.error('Error starting service:', error);
      alert('❌ ' + (error.message || 'Error al iniciar el servicio'));
    }
  };

  const handleCompleteService = async (serviceId) => {
    try {
      if (window.confirm('¿Confirmas que has completado este servicio?')) {
        await driverService.completeService(serviceId);
        
        // Emitir evento de actualización de estado
        const event = new CustomEvent('serviceStatusUpdated', {
          detail: { serviceId, newStatus: 'completado' }
        });
        window.dispatchEvent(event);
        
        alert('✅ Servicio completado correctamente');
        fetchMyServices(); // Actualizar la lista
      }
    } catch (error) {
      console.error('Error completing service:', error);
      alert('❌ ' + (error.message || 'Error al completar el servicio'));
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'aceptado': {
        text: 'Aceptado',
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.2)',
        icon: 'bi-check-circle'
      },
      'en_proceso': {
        text: 'En Proceso',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.2)',
        icon: 'bi-truck'
      },
      'completado': {
        text: 'Completado',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.2)',
        icon: 'bi-check-circle-fill'
      },
      'cancelado': {
        text: 'Cancelado',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.2)',
        icon: 'bi-x-circle'
      }
    };
    
    return statusMap[status] || statusMap['aceptado'];
  };

  const formatDate = (dateString) => {
    return driverService.formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="info-card">
        <div className="card-header">
          <h2 className="card-title">Mis Servicios</h2>
          <p className="card-description">Cargando tus servicios asignados...</p>
        </div>
        <div className="card-content">
          <div className="info-item">
            <div className="info-icon">⏳</div>
            <div className="info-details">
              <p className="info-label">Estado</p>
              <p className="info-value">Obteniendo información...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="info-card">
        <div className="card-header">
          <h2 className="card-title">Mis Servicios</h2>
          <p className="card-description">Error al cargar servicios</p>
        </div>
        <div className="card-content">
          <div className="info-item">
            <div className="info-icon">❌</div>
            <div className="info-details">
              <p className="info-label">Error</p>
              <p className="info-value">{error}</p>
              <button
                onClick={fetchMyServices}
                className="action-btn primary"
                style={{ marginTop: '1rem' }}
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="info-card">
      <div className="card-header">
        <h2 className="card-title">Mis Servicios</h2>
        <p className="card-description">Gestiona tus servicios asignados</p>
        <button
          onClick={fetchMyServices}
          className="action-btn primary"
          style={{ 
            width: 'auto', 
            padding: '0.5rem 1rem',
            fontSize: '0.85rem'
          }}
        >
          <i className="bi bi-arrow-repeat"></i> Actualizar
        </button>
      </div>
      
      <div className="card-content">
        {services.length === 0 ? (
          <div className="info-item" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="info-icon" style={{ fontSize: '3rem' }}>📋</div>
            <div className="info-details">
              <h3 className="info-value" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                No tienes servicios asignados
              </h3>
              <p className="info-label">Los servicios que aceptes aparecerán aquí.</p>
            </div>
          </div>
        ) : (
          <div className="form-grid" style={{ gap: '1rem' }}>
            {services.map((service) => {
              const statusInfo = getStatusInfo(service.status);
              
              return (
                <div
                  key={service.id}
                  className="info-item"
                  style={{ 
                    flexDirection: 'column', 
                    alignItems: 'stretch',
                    padding: '1.25rem',
                    gap: '0.75rem',
                    border: `2px solid ${statusInfo.color}40`,
                    borderRadius: '12px'
                  }}
                >
                  {/* Header del servicio */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    gap: '1rem' 
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        marginBottom: '0.5rem' 
                      }}>
                        <h4 className="info-value" style={{ margin: 0, fontSize: '1rem' }}>
                          Servicio #{service.id}
                        </h4>
                        <span 
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: statusInfo.bgColor,
                            color: statusInfo.color,
                            border: `1px solid ${statusInfo.color}60`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <i className={statusInfo.icon}></i>
                          {statusInfo.text}
                        </span>
                      </div>
                      <p className="info-label" style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>
                        {service.description}
                      </p>
                      <div className="info-details" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        <span className="info-label">Cliente: </span>
                        <span className="info-value">
                          {service.cliente.nombre} {service.cliente.apellido} - {service.cliente.telefono}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 'fit-content' }}>
                      <div className="info-value" style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>
                        ${service.price?.toLocaleString('es-CO')}
                      </div>
                      <div className="info-label" style={{ fontSize: '0.7rem', margin: 0 }}>
                        {formatDate(service.created_date)}
                      </div>
                    </div>
                  </div>

                  {/* Rutas */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '0.75rem',
                    fontSize: '0.8rem'
                  }}>
                    <div>
                      <label className="info-label" style={{ marginBottom: '0.25rem', fontSize: '0.7rem' }}>
                        🏠 Origen:
                      </label>
                      <p className="info-value" style={{ margin: 0 }}>
                        {service.origin}
                      </p>
                    </div>
                    <div>
                      <label className="info-label" style={{ marginBottom: '0.25rem', fontSize: '0.7rem' }}>
                        🎯 Destino:
                      </label>
                      <p className="info-value" style={{ margin: 0 }}>
                        {service.destination}
                      </p>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.75rem', 
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.75rem'
                  }}>
                    <div className="info-details">
                      <span className="info-label">Peso: </span>
                      <span className="info-value">{service.weight}</span>
                    </div>
                    <div className="info-details">
                      <span className="info-label">Distancia: </span>
                      <span className="info-value">{service.distance}</span>
                    </div>
                    <div className="info-details">
                      <span className="info-label">Tipo: </span>
                      <span className="info-value">{service.cargo_type}</span>
                    </div>
                  </div>

                  {/* Botones de acción según el estado */}
                  {service.status === 'aceptado' && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <button
                        onClick={() => handleStartService(service.id)}
                        className="action-btn warning"
                        style={{
                          padding: '0.5rem 1.5rem',
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.8), rgba(217, 119, 6, 0.8))',
                          color: '#ffffff',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '6px',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <i className="bi bi-play-circle-fill"></i> Iniciar Servicio
                      </button>
                    </div>
                  )}

                  {service.status === 'en_proceso' && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <button
                        onClick={() => handleCompleteService(service.id)}
                        className="action-btn success"
                        style={{
                          padding: '0.5rem 1.5rem',
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(34, 197, 94, 0.8))',
                          color: '#ffffff',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '6px',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <i className="bi bi-check-circle-fill"></i> Marcar Completado
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyServicesCard;