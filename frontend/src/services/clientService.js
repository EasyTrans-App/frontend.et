const API_BASE_URL = 'http://localhost:4002/api'; // Cambiado de 3000 a 4002

class ClientService {
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

  // Crear nuevo servicio/envío
  async createService(serviceData) {
    try {
      console.log('📦 Enviando datos del servicio:', serviceData);
      
      const response = await fetch(`${this.baseURL}/clients/services`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(serviceData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el servicio');
      }

      console.log('✅ Servicio creado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creando servicio:', error);
      throw error;
    }
  }

  // Obtener servicios del cliente
  async getServices() {
    try {
      const response = await fetch(`${this.baseURL}/clients/services`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener servicios');
      }

      return data;
    } catch (error) {
      console.error('❌ Error obteniendo servicios:', error);
      throw error;
    }
  }

  // Obtener detalles de un servicio específico
  async getServiceDetails(serviceId) {
    try {
      const response = await fetch(`${this.baseURL}/clients/services/${serviceId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener detalles del servicio');
      }

      return data;
    } catch (error) {
      console.error('❌ Error obteniendo detalles del servicio:', error);
      throw error;
    }
  }

  // Calcular precio estimado (opcional, para mostrar antes de enviar)
  calculateEstimatedPrice(peso, distancia) {
    const PRECIO_BASE = 5000;
    const TARIFA_POR_KM = 800;
    const TARIFA_POR_KG = 50;
    
    return PRECIO_BASE + (distancia * TARIFA_POR_KM) + (peso * TARIFA_POR_KG);
  }
}

const clientServiceInstance = new ClientService();
export default clientServiceInstance;
