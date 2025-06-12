//EASYTRANS/frontend/src/services/driverService.js
const API_BASE_URL = 'http://localhost:3000/api'; // Cambiado a puerto del gateway

class DriverService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Headers con autenticación
  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Obtener servicios disponibles (pendientes)
  async getAvailableServices() {
    try {
      console.log('🚚 Obteniendo servicios disponibles...');
      
      const response = await fetch(`${this.baseURL}/drivers/services/available`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener servicios disponibles');
      }

      console.log('✅ Servicios disponibles obtenidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo servicios disponibles:', error);
      throw error;
    }
  }

  // Obtener servicios asignados al conductor
  async getMyServices() {
    try {
      console.log('🚚 Obteniendo mis servicios...');
      
      const response = await fetch(`${this.baseURL}/drivers/services`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener mis servicios');
      }

      console.log('✅ Mis servicios obtenidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo mis servicios:', error);
      throw error;
    }
  }

  // Aceptar un servicio
  async acceptService(serviceId) {
    try {
      console.log(`🚚 Aceptando servicio ${serviceId}...`);
      
      const response = await fetch(`${this.baseURL}/drivers/services/${serviceId}/respond`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ accion: 'aceptar' }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al aceptar el servicio');
      }

      console.log('✅ Servicio aceptado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error aceptando servicio:', error);
      throw error;
    }
  }

  // Rechazar un servicio
  async rejectService(serviceId) {
    try {
      console.log(`🚚 Rechazando servicio ${serviceId}...`);
      
      const response = await fetch(`${this.baseURL}/drivers/services/${serviceId}/respond`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ accion: 'rechazar' }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al rechazar el servicio');
      }

      console.log('✅ Servicio rechazado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error rechazando servicio:', error);
      throw error;
    }
  }

  // Actualizar estado de un servicio (en_proceso o completado)
  async updateServiceStatus(serviceId, status) {
    try {
      console.log(`🚚 Actualizando servicio ${serviceId} a estado: ${status}`);
      
      const response = await fetch(`${this.baseURL}/drivers/services/${serviceId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ estado: status }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el estado del servicio');
      }

      console.log('✅ Estado del servicio actualizado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error actualizando estado del servicio:', error);
      throw error;
    }
  }

  // Iniciar un servicio (cambiar a 'en_proceso')
  async startService(serviceId) {
    return this.updateServiceStatus(serviceId, 'en_proceso');
  }

  // Completar un servicio (cambiar a 'completado')
  async completeService(serviceId) {
    return this.updateServiceStatus(serviceId, 'completado');
  }

  // Mapear datos de la API a la estructura del componente
  mapServiceData(services) {
    return services.map(service => ({
      id: service.id_servicio,
      origin: service.direccion_recogida,
      destination: service.direccion_entrega,
      dimensions: service.dimensiones || 'No especificado',
      weight: service.peso || 'No especificado',
      price: service.precio,
      distance: service.distancia_km ? `${service.distancia_km} km` : 'No especificado',
      cargo_type: service.tipo_carga,
      description: service.descripcion_carga,
      created_date: service.fecha_creacion,
      status: service.estado,
      priority: this.calculatePriority(service), // Calcular prioridad basada en datos
      cliente: {
        nombre: service.cliente_nombre,
        apellido: service.cliente_apellido,
        telefono: service.cliente_telefono
      }
    }));
  }

  // Calcular prioridad basada en el precio y otros factores
  calculatePriority(service) {
    const precio = service.precio || 0;
    const distancia = service.distancia_km || 0;
    
    // Lógica simple para asignar prioridad
    if (precio > 150000 || distancia > 300) {
      return 'alta';
    } else if (precio > 80000 || distancia > 150) {
      return 'media';
    } else {
      return 'baja';
    }
  }

  // Formatear fecha
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obtener estadísticas del conductor (opcional)
  async getDriverStats() {
    try {
      const services = await this.getMyServices();
      
      const stats = {
        total: services.length,
        completados: services.filter(s => s.estado === 'completado').length,
        en_proceso: services.filter(s => s.estado === 'en_proceso').length,
        aceptados: services.filter(s => s.estado === 'aceptado').length,
        ingresos_totales: services
          .filter(s => s.estado === 'completado')
          .reduce((total, s) => total + (s.precio || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// ⭐ CAMBIO IMPORTANTE: Exportar la instancia directamente
const driverService = new DriverService();
export default driverService;