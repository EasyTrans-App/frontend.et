import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { 
  createService, 
  getServicesByClient, 
  getServiceDetails,
  getUserProfile,
  updateUserProfile 
} from '../controllers/clientController.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Servicios
router.post('/services', createService);
router.get('/services', getServicesByClient);
router.get('/services/:id', getServiceDetails);
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);

export default router;