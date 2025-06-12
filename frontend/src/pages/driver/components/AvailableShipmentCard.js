//EASYTRANS/frontend/src/pages/driver/components/AvailableShipmentCard.js
import { useState, useEffect } from 'react';
import driverService from '../../../services/driverService';

const AvailableShipmentsCard = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await driverService.getAvailableServices();
      const mappedData = driverService.mapServiceData(data);
      
      setShipments(mappedData);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      setError(error.message || 'Error al cargar los servicios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (shipmentId) => {
    try {
      await driverService.acceptService(shipmentId);
      
      // Actualizar la lista eliminando el servicio aceptado
      setShipments(prev => prev.filter(s => s.id !== shipmentId));
      
      // Emitir evento personalizado para notificar a MyServicesCard
      const event = new CustomEvent('serviceAccepted', {
        detail: { serviceId: shipmentId }
      });
      window.dispatchEvent(event);
      
      alert('✅ Servicio aceptado correctamente');
    } catch (error) {
      console.error('Error accepting shipment:', error);
      alert('❌ ' + (error.message || 'Error al aceptar el servicio'));
    }
  };

  const handleReject = async (shipmentId) => {
    try {
      // Confirmar antes de rechazar
      if (window.confirm('¿Estás seguro de que quieres rechazar este servicio?')) {
        await driverService.rejectService(shipmentId);
        
        // Actualizar la lista eliminando el servicio rechazado
        setShipments(prev => prev.filter(s => s.id !== shipmentId));
        alert('⚠️ Servicio rechazado correctamente');
      }
    } catch (error) {
      console.error('Error rejecting shipment:', error);
      alert('❌ ' + (error.message || 'Error al rechazar el servicio'));
    }
  };

  const formatDate = (dateString) => {
    return driverService.formatDate(dateString);
  };

  const getCargoTypeByWeight = (weight) => {
    const weightValue = parseFloat(weight?.toString().replace(/[^\d.]/g, '')) || 0;
    
    if (weightValue >= 1000) {
      return 'pesada';
    } else {
      return 'liviana';
    }
  };

  const getCargoTypeColor = (weight) => {
    const cargoType = getCargoTypeByWeight(weight);
    return cargoType === 'pesada' ? 'status-proceso' : 'status-completado';
  };

  const getCargoTypeText = (weight) => {
    const cargoType = getCargoTypeByWeight(weight);
    return cargoType === 'pesada' ? 'Carga Pesada' : 'Carga Liviana';
  };

  if (loading) {
    return (
      <div className="shipment-card">
        <div className="shipment-card-content">
          <div className="title-shipment">Cargando envíos disponibles...</div>
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
      <div className="shipment-card">
        <div className="shipment-card-content">
          <div className="title-shipment">Error</div>
          <div className="info-item">
            <div className="info-icon">❌</div>
            <div className="info-details">
              <p className="info-label">Error</p>
              <p className="info-value">{error}</p>
              <button
                onClick={fetchShipments}
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
    <div className="shipment-card">
      <div className="shipment-card-content">
        <div className="card-header">
          <h1 className="title-shipment">Envíos Disponibles</h1>
          <div className="submit-btn">
            <button
              type="button"
              onClick={fetchShipments}
              className="action-btn primary"
              style={{ 
                width: 'auto', 
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.8), rgba(59, 130, 246, 0.8))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }}
            >
              <i className="bi bi-arrow-repeat"></i> Actualizar
            </button>
          </div>
        </div>

        {shipments.length === 0 ? (
          <div className="card-content">
            <div className="info-item" style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="info-icon" style={{ fontSize: '4rem' }}>🚚</div>
              <div className="info-details">
                <h3 className="info-value" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  No hay envíos disponibles
                </h3>
                <p className="info-label">Los nuevos envíos aparecerán aquí cuando estén disponibles.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-content">
            <div className="form-grid" style={{ gap: '1.5rem' }}>
              {shipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="info-item"
                  style={{ 
                    flexDirection: 'column', 
                    alignItems: 'stretch',
                    padding: '1.5rem',
                    gap: '1rem',
                    minWidth: '40rem'
                  }}
                >
                  {/* Header del envío */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h4 className="info-value" style={{ margin: 0, fontSize: '1.1rem' }}>
                          Servicio #{shipment.id}
                        </h4>
                        <span 
                          className={`${getCargoTypeColor(shipment.weight)}`}
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: getCargoTypeByWeight(shipment.weight) === 'pesada' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: getCargoTypeByWeight(shipment.weight) === 'pesada' ? '#0ea5e9' : '#10b981',
                            border: `1px solid ${getCargoTypeByWeight(shipment.weight) === 'pesada' ? '#0ea5e9' : '#10b981'}40`
                          }}
                        >
                          {getCargoTypeText(shipment.weight)}
                        </span>
                      </div>
                      <p className="info-label" style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                        {shipment.description}
                      </p>
                      <div className="info-details" style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        <span className="info-label">Cliente: </span>
                        <span className="info-value">
                          {shipment.cliente.nombre} {shipment.cliente.apellido} - {shipment.cliente.telefono}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 'fit-content' }}>
                      <div className="info-value" style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0' }}>
                        ${shipment.price?.toLocaleString('es-CO')}
                      </div>
                      <div className="info-label" style={{ fontSize: '0.75rem', margin: 0 }}>
                        {formatDate(shipment.created_date)}
                      </div>
                    </div>
                  </div>

                  {/* Direcciones */}
                  <div className="form-grid" style={{ gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="info-label" style={{ marginBottom: '0.25rem' }}>🏠 Origen:</label>
                      <p className="info-value" style={{ margin: 0, fontSize: '0.9rem' }}>
                        {shipment.origin}
                      </p>
                    </div>
                    <div className="form-group">
                      <label className="info-label" style={{ marginBottom: '0.25rem' }}>🎯 Destino:</label>
                      <p className="info-value" style={{ margin: 0, fontSize: '0.9rem' }}>
                        {shipment.destination}
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
                      <span className="info-value">{shipment.cargo_type}</span>
                    </div>
                    <div className="info-details">
                      <span className="info-label">Peso: </span>
                      <span className="info-value">{shipment.weight}</span>
                    </div>
                    <div className="info-details">
                      <span className="info-label">Distancia: </span>
                      <span className="info-value">{shipment.distance}</span>
                    </div>
                    <div className="info-details">
                      <span className="info-label">Dimensiones: </span>
                      <span className="info-value">{shipment.dimensions}</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    paddingTop: '1rem',
                    gap: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <button
                      onClick={() => handleAccept(shipment.id)}
                      className="action-btn success"
                      style={{
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(34, 197, 94, 0.8))',
                        color: '#ffffff',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <i className="bi bi-check-circle-fill"></i> Aceptar Servicio
                    </button>
                    <button
                      onClick={() => handleReject(shipment.id)}
                      className="action-btn danger"
                      style={{
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.8))',
                        color: '#ffffff',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <i className="bi bi-x-circle-fill"></i> Rechazar Servicio
                    </button>
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

export default AvailableShipmentsCard;