// EASYTRANS/frontend/src/pages/driver/Dashboard.js
import { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/modal';
import AvailableShipmentCard from './components/AvailableShipmentCard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard-container">
      {/* Encabezado con resumen */}
      <div className="summary-card">
        <div className="summary-header">
          <h1 className="dashboard-title">Bienvenido, {user?.nombre} {user?.apellido}</h1>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>

      {/* Información Personal */}
      <div className="info-card">
        <div className="card-header">
          <h2 className="card-title">Información Personal</h2>
          <p className="card-description">Revisa y gestiona tu información de perfil.</p>
        </div>
        <div className="card-content">
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon"><i className="bi bi-person-circle"></i></div>
              <div className="info-details">
                <p className="info-label">Nombre Completo</p>
                <p className="info-value">{user?.nombre} {user?.apellido}</p>
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
              <div className="info-icon"><i className="bi bi-truck"></i></div>
              <div className="info-details">
                <p className="info-label">Tipo de Usuario</p>
                <p className="info-value">{user?.tipo}</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><i className="bi bi-card-checklist"></i></div>
              <div className="info-details">
                <p className="info-label">ID de Conductor</p>
                <p className="info-value">{user?.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones de Conductor */}
      <div className="actions-card">
        <div className="card-header">
          <h2 className="card-title">Acciones de Conductor</h2>
          <p className="card-description">Gestiona tu disponibilidad y servicios.</p>
        </div>
        <div className="card-content">
          <div className="actions-grid">
            <button className="action-btn primary" onClick={handleOpenModal}>
              <div className="action-icon"><i className="bi bi-clipboard-data-fill"></i></div>
              <div className="action-text">
                <span className="action-title">Ver Solicitudes Pendientes</span>
                <span className="action-subtitle">Revisar nuevas ofertas</span>
              </div>
            </button>
            <button className="action-btn primary">
              <div className="action-icon"><i className="bi bi-send-fill"></i></div>
              <div className="action-text">
                <span className="action-title">Historial de Viajes</span>
                <span className="action-subtitle">Ver viajes completados</span>
              </div>
            </button>
            <button className="action-btn primary">
              <div className="action-icon"><i className="bi bi-nut"></i></div>
              <div className="action-text">
                <span className="action-title">Configurar Vehículo</span>
                <span className="action-subtitle">Editar datos del vehículo</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mis solicitudes */}
      <div className="stats-card">
        <div className="card-header">
          
        </div>
        <div className="card-content">
          
        </div>
      </div>

      {/* Estadísticas del Día */}
      <div className="stats-card">
        <div className="card-header">
          <h2 className="card-title">Estadísticas del Día</h2>
          <p className="card-description">Resumen de tu actividad diaria.</p>
        </div>
        <div className="card-content">
          <div className="stats-grid">
            <div className="info-item primary">
              <div className="stats-icon"><i className="bi bi-truck"></i></div>
              <div className="stats-details">
                <div className="stats-value">0</div>
                <div className="stats-label">Viajes Completados</div>
              </div>
            </div>
            <div className="info-item success">
              <div className="stats-icon"><i className="bi bi-coin"></i></div>
              <div className="stats-details">
                <div className="stats-value">$0</div>
                <div className="stats-label">Ganancias</div>
              </div>
            </div>
            <div className="info-item warning">
              <div className="stats-icon"><i className="bi bi-alarm"></i></div>
              <div className="stats-details">
                <div className="stats-value">0h</div>
                <div className="stats-label">Tiempo Online</div>
              </div>
            </div>
            <div className="info-item danger">
              <div className="stats-icon"><i className="bi bi-rulers"></i></div>
              <div className="stats-details">
                <div className="stats-value">0km</div>
                <div className="stats-label">Distancia</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Solicitudes Pendientes */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="modal-body">
          <AvailableShipmentCard />
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;