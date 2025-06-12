import { Router } from 'express';
import { 
  getAvailableServices,
  respondToService,
  updateServiceStatus,
  getDriverServices
} from '../controllers/driverController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Todas las rutas requieren autenticación JWT
router.use(authenticate);

// Obtener servicios disponibles
router.get('/services/available', getAvailableServices);

// Obtener servicios asignados al conductor
router.get('/services', getDriverServices);

// Aceptar o rechazar servicio
router.post('/services/:id_servicio/respond', respondToService);

// Actualizar estado del servicio (en_proceso o completado)
router.put('/services/:id_servicio/status', updateServiceStatus);

export default router;