//Ruta: EASYTRANS/frontend/src/pages/client/components/NewShipmentCard.js
import { useState } from 'react';
import clientService from '../../../services/clientService';

const NewShipmentCard = ({ onServiceCreated }) => {
  const [shipment, setShipment] = useState({
    descripcion_carga: '',
    tipo_carga: 'paquete',
    peso: '',
    dimensiones: '',
    direccion_recogida: '',
    direccion_entrega: '',
    distancia_km: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const tiposCarga = [
    { value: 'paquete', label: 'Paquete' },
    { value: 'documento', label: 'Documento' },
    { value: 'electronico', label: 'Electrónico' },
    { value: 'fragil', label: 'Frágil' },
    { value: 'otro', label: 'Otro' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShipment(prev => ({ ...prev, [name]: value }));

    if (name === 'peso' || name === 'distancia_km') {
      const peso = name === 'peso' ? parseFloat(value) || 0 : parseFloat(shipment.peso) || 0;
      const distancia = name === 'distancia_km' ? parseFloat(value) || 0 : parseFloat(shipment.distancia_km) || 0;
      if (peso > 0 && distancia > 0) {
        const precio = clientService.calculateEstimatedPrice(peso, distancia);
        setEstimatedPrice(precio);
      }
    }

    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const required = ['descripcion_carga', 'tipo_carga', 'peso', 'direccion_recogida', 'direccion_entrega', 'distancia_km'];
    for (let field of required) {
      if (!shipment[field]) {
        setError(`El campo ${field.replace('_', ' ')} es obligatorio`);
        return false;
      }
    }

    if (parseFloat(shipment.peso) <= 0) {
      setError('El peso debe ser mayor a 0');
      return false;
    }

    if (parseFloat(shipment.distancia_km) <= 0) {
      setError('La distancia debe ser mayor a 0');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const serviceData = {
        ...shipment,
        peso: parseFloat(shipment.peso),
        distancia_km: parseFloat(shipment.distancia_km)
      };

      const result = await clientService.createService(serviceData);
      setSuccess(`¡Servicio creado exitosamente! ID: ${result.id_servicio}. Precio estimado: $${result.precio_estimado.toLocaleString()}`);
      setShipment({
        descripcion_carga: '',
        tipo_carga: 'paquete',
        peso: '',
        dimensiones: '',
        direccion_recogida: '',
        direccion_entrega: '',
        distancia_km: ''
      });
      setEstimatedPrice(0);
      if (onServiceCreated) onServiceCreated(result);
    } catch (error) {
      setError(error.message || 'Error al crear el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shipment-card">
      <div className="shipment-card-content">
        <h1 className="title-shipment">Solicitar Nuevo Transporte</h1>
        <p className="subtitle-shipment">Complete los detalles de su envío</p>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="tipo_carga">Tipo de Carga *</label>
            <select className='form-select' name="tipo_carga" id="tipo_carga" value={shipment.tipo_carga} onChange={handleChange}>
              {tiposCarga.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="peso">Peso (kg) *</label>
            <input type="number" name="peso" id="peso" step="0.1" min="0.1" value={shipment.peso} onChange={handleChange} placeholder="Ej: 2.5" />
          </div>

          <div className="form-group">
            <label htmlFor="dimensiones">Dimensiones (LxAxA cm)</label>
            <input type="text" name="dimensiones" id="dimensiones" value={shipment.dimensiones} onChange={handleChange} placeholder="Ej: 30x20x15" />
          </div>

          <div className="form-group">
            <label htmlFor="distancia_km">Distancia (km) *</label>
            <input type="number" name="distancia_km" id="distancia_km" step="0.1" min="0.1" value={shipment.distancia_km} onChange={handleChange} placeholder="Ej: 15.5" />
          </div>

          <div className="form-group full">
            <label htmlFor="direccion_recogida">Dirección de Recogida *</label>
            <input type="text" name="direccion_recogida" id="direccion_recogida" value={shipment.direccion_recogida} onChange={handleChange} placeholder="Calle 123 #45-67, Bogotá" />
          </div>

          <div className="form-group full">
            <label htmlFor="direccion_entrega">Dirección de Entrega *</label>
            <input type="text" name="direccion_entrega" id="direccion_entrega" value={shipment.direccion_entrega} onChange={handleChange} placeholder="Carrera 89 #12-34, Medellín" />
          </div>

          <div className="form-group full">
            <label htmlFor="descripcion_carga">Descripción de la Carga *</label>
            <textarea className='descripcion_carga' name="descripcion_carga" id="descripcion_carga" rows="3" value={shipment.descripcion_carga} onChange={handleChange} placeholder="Describe detalladamente qué necesitas transportar" />
          </div>
        </div>

        {estimatedPrice > 0 && (
          <div className="estimated-price">
            <p><strong>Precio Estimado:</strong> ${estimatedPrice.toLocaleString()}</p>
            <p className="note">*Este es un precio estimado. El precio final puede variar.</p>
          </div>
        )}

        <div className="submit-btn">
          <button type="button" onClick={handleSubmit} disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? 'Procesando...' : 'Solicitar Transporte'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewShipmentCard;
