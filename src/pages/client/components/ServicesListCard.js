//Ruta: EASYTRANS/frontend/src/pages/client/components/ServicesListCard.js
import { useState, useEffect } from 'react';
import clientService from '../../../services/clientService';

const ServicesListCard = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await clientService.getServices();
      setServices(data);
    } catch (error) {
      setError(error.message || 'Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'status-pendiente';
      case 'en_proceso':
        return 'status-proceso';
      case 'completado':
        return 'status-completado';
      case 'cancelado':
        return 'status-cancelado';
      default:
        return 'status-default';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_proceso':
        return 'En Proceso';
      case 'completado':
        return 'Completado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="shipment-card">
        <div className="shipment-card-content">
          <div className="title-shipment">Cargando servicios...</div>
          <div className="info-item">
            <div className="info-icon"><i class="bi bi-hourglass-split"></i></div>
            <div className="info-details">
              <p className="info-label">Estado</p>
              <p className="info-value">Obteniendo información...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shipment-card-list">
      <div className="shipment-card-content">
        <div className="card-header">
          <h1 className="title-shipment">Mis Servicios</h1>
          <div className="submit-btn">
            <button
              type="button"
              onClick={loadServices}
              className="action-btn primary"
              style={{ 
                width: 'auto', 
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.8), rgba(59, 130, 246, 0.8))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }}
            >
              <i class="bi bi-arrow-repeat"></i> Actualizar
            </button>
          </div>
        </div>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {services.length === 0 ? (
          <div className="card-content">
            <div className="info-item" style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="info-icon" style={{ fontSize: '4rem' }}>📦</div>
              <div className="info-details">
                <h3 className="info-value" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  No tienes servicios aún
                </h3>
                <p className="info-label">Crea tu primera solicitud de transporte para comenzar.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-content">
            <div className="form-grid" style={{ gap: '1.5rem' }}>
              {services.map((service) => (
                <div
                  key={service.id_servicio}
                  className="info-item"
                  style={{ 
                    flexDirection: 'column', 
                    alignItems: 'stretch',
                    padding: '1.5rem',
                    gap: '1rem',
                    minWidth: '40rem',
                  }}
                >
                  {/* Header del servicio */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h4 className="info-value" style={{ margin: 0, fontSize: '1.1rem' }}>
                          Servicio #{service.id_servicio}
                        </h4>
                        <span 
                          className={`${getStatusColor(service.estado)}`}
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: service.estado === 'completado' ? 'rgba(16, 185, 129, 0.2)' :
                                       service.estado === 'en_proceso' ? 'rgba(14, 165, 233, 0.2)' :
                                       service.estado === 'pendiente' ? 'rgba(245, 158, 11, 0.2)' :
                                       'rgba(239, 68, 68, 0.2)',
                            color: service.estado === 'completado' ? '#10b981' :
                                   service.estado === 'en_proceso' ? '#0ea5e9' :
                                   service.estado === 'pendiente' ? '#f59e0b' :
                                   '#ef4444',
                            border: `1px solid ${service.estado === 'completado' ? '#10b981' :
                                                 service.estado === 'en_proceso' ? '#0ea5e9' :
                                                 service.estado === 'pendiente' ? '#f59e0b' :
                                                 '#ef4444'}40`
                          }}
                        >
                          {getStatusText(service.estado)}
                        </span>
                      </div>
                      <p className="info-label" style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                        {service.descripcion_carga}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 'fit-content' }}>
                      <div className="info-value" style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0' }}>
                        ${service.precio?.toLocaleString()}
                      </div>
                      <div className="info-label" style={{ fontSize: '0.75rem', margin: 0 }}>
                        {formatDate(service.fecha_creacion)}
                      </div>
                    </div>
                  </div>

                  {/* Direcciones */}
                  <div className="form-grid" style={{ gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="info-label" style={{ marginBottom: '0.25rem' }}>Desde:</label>
                      <p className="info-value" style={{ margin: 0, fontSize: '0.9rem' }}>
                        {service.direccion_recogida}
                      </p>
                    </div>
                    <div className="form-group">
                      <label className="info-label" style={{ marginBottom: '0.25rem' }}>Hasta:</label>
                      <p className="info-value" style={{ margin: 0, fontSize: '0.9rem' }}>
                        {service.direccion_entrega}
                      </p>
                    </div>
                  </div>

                  {/* Detalles técnicos */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '1rem', 
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.85rem'
                  }}>
                    <div className="info-details">
                      <span className="info-label">Tipo: </span>
                      <span className="info-value">{service.tipo_carga}</span>
                    </div>
                    <div className="info-details">
                      <span className="info-label">Peso: </span>
                      <span className="info-value">{service.peso} kg</span>
                    </div>
                    <div className="info-details">
                      <span className="info-label">Distancia: </span>
                      <span className="info-value">{service.distancia_km} km</span>
                    </div>
                    {service.dimensiones && (
                      <div className="info-details">
                        <span className="info-label">Dimensiones: </span>
                        <span className="info-value">{service.dimensiones}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesListCard;