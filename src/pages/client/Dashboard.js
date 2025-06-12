import { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import NewShipmentCard from "./components/NewShipmentCard";
import ServicesListCard from "./components/ServicesListCard";
import EditProfile from "./components/EditProfile";
import Modal from "../../components/modal";
import clientService from "../../services/clientService";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showNewShipment, setShowNewShipment] = useState(false);
  const [showServicesList, setShowServicesList] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Estados para las solicitudes en el dashboard
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState('');

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  // Cargar servicios al montar el componente
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const data = await clientService.getServices();
      setServices(data);
      setServicesError('');
    } catch (error) {
      setServicesError(error.message || 'Error al cargar los servicios');
    } finally {
      setLoadingServices(false);
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

  // Función para actualizar servicios después de crear uno nuevo
  const handleNewShipmentClose = () => {
    setShowNewShipment(false);
    loadServices(); // Recargar servicios después de crear uno nuevo
  };

  return (
    <div className="dashboard-container">
      {/* Modales */}
      <Modal isOpen={showNewShipment} onClose={handleNewShipmentClose}>
        <NewShipmentCard />
      </Modal>
      <Modal isOpen={showServicesList} onClose={() => setShowServicesList(false)}>
        <ServicesListCard />
      </Modal>
      <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)}>
        <EditProfile />
      </Modal>

      {/* Encabezado con resumen */}
      <div className="summary-card">
        <div className="summary-header">
          <h1 className="dashboard-title">
            Bienvenido, {user?.nombre} {user?.apellido}
          </h1>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>

      {/* Información Personal */}
      <div className="info-card">
        <div className="card-header">
          <h2 className="card-title">Información Personal</h2>
          <p className="card-description">
            Revisa y gestiona tu información de perfil.
          </p>
        </div>
        <div className="card-content">
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon"><i className="bi bi-person-circle"></i></div>
              <div className="info-details">
                <p className="info-label">Nombre Completo</p>
                <p className="info-value">
                  {user?.nombre} {user?.apellido}
                </p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><i className="bi bi-envelope-at-fill"></i></div>
              <div className="info-details">
                <p className="info-label">Correo Electrónico</p>
                <p className="info-value">{user?.email}</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><i className="bi bi-person-walking"></i></div>
              <div className="info-details">
                <p className="info-label">Tipo de Usuario</p>
                <p className="info-value">{user?.tipo}</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><i className="bi bi-card-checklist"></i></div>
              <div className="info-details">
                <p className="info-label">ID de Usuario</p>
                <p className="info-value">{user?.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="actions-card">
        <div className="card-header">
          <h2 className="card-title">Acciones Rápidas</h2>
          <p className="card-description">
            Gestiona tus solicitudes y configuraciones.
          </p>
        </div>
        <div className="card-content">
          <div className="actions-grid">
            <button
              className="action-btn primary"
              onClick={() => setShowNewShipment(true)}
            >
              <div className="action-icon"><i className="bi bi-box-seam"></i></div>
              <div className="action-text">
                <span className="action-title">Solicitar Transporte</span>
                <span className="action-subtitle">Crear nueva solicitud</span>
              </div>
            </button>

            <button
              className="action-btn primary"
              onClick={() => setShowServicesList(true)}
            >
              <div className="action-icon"><i className="bi bi-send-fill"></i></div>
              <div className="action-text">
                <span className="action-title">Tus envíos</span>
                <span className="action-subtitle">
                  Revisa tus envíos pendientes
                </span>
              </div>
            </button>
            <button 
              className="action-btn primary"
              onClick={() => setShowEditProfile(true)}
            >
              <div className="action-icon"><i className="bi bi-nut"></i></div>
              <div className="action-text">
                <span className="action-title">Configurar Perfil</span>
                <span className="action-subtitle">
                  Editar información personal
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mis solicitudes */}
      <div className="stats-card">
        <div className="card-header">
          <h2 className="card-title">Mis solicitudes</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p className="card-description">Aquí puedes ver el estado de tus envíos.</p>
            <button
              type="button"
              onClick={loadServices}
              className="action-btn primary"
              style={{ 
                width: 'auto', 
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.8), rgba(59, 130, 246, 0.8))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}
            >
              <i className="bi bi-arrow-repeat"></i> Actualizar
            </button>
          </div>
        </div>
        <div className="card-content">
          {loadingServices ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="info-icon" style={{ fontSize: '3rem' }}><i className="bi bi-hourglass-split"></i></div>
              <div className="info-details">
                <p className="info-value">Cargando servicios...</p>
              </div>
            </div>
          ) : servicesError ? (
            <div className="alert error" style={{ textAlign: 'center', padding: '1rem', marginBottom: '1rem' }}>
              {servicesError}
            </div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="info-icon" style={{ fontSize: '4rem' }}>📦</div>
              <div className="info-details">
                <h3 className="info-value" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  No tienes servicios aún
                </h3>
                <p className="info-label">Crea tu primera solicitud de transporte para comenzar.</p>
              </div>
            </div>
          ) : (
            <div className="form-grid" style={{ gap: '1.5rem' }}>
              {services.slice(0, 3).map((service) => (
                <div
                  key={service.id_servicio}
                  className="info-item"
                  style={{ 
                    flexDirection: 'column', 
                    alignItems: 'stretch',
                    padding: '1.5rem',
                    gap: '1rem',
                    minWidth: '100%',
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
              
              {services.length > 3 && (
                <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                  <button
                    className="action-btn primary"
                    onClick={() => setShowServicesList(true)}
                    style={{ 
                      width: 'auto', 
                      padding: '0.75rem 1.5rem',
                    }}
                  >
                    Ver todos los servicios ({services.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;