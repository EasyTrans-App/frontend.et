// EASYTRANS/gateway/routes/clientRoutes.js
import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import fetch from 'node-fetch';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

const CLIENT_SERVICE_URL = process.env.CLIENT_SERVICE_URL || 'http://localhost:4002';
console.log('🔗 Client Service URL:', CLIENT_SERVICE_URL);

// Helper function para hacer peticiones al client-service
const forwardToClientService = async (req, res, endpoint, method = 'GET') => {
  try {
    console.log(`🚀 Forwarding ${method} ${endpoint} to client-service`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || ''
      }
    };

    // Si hay body, añadirlo
    if (method !== 'GET' && req.body) {
      options.body = JSON.stringify(req.body);
      console.log('📦 Body forwarded:', req.body);
    }

    const response = await fetch(`${CLIENT_SERVICE_URL}${endpoint}`, options);
    const data = await response.json();

    console.log(`✅ Response from client-service: ${response.status}`);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ Error forwarding to client-service:', error.message);
    res.status(500).json({ 
      error: 'Error connecting to client service',
      details: error.message 
    });
  }
};

// ========== RUTAS DE PERFIL DE USUARIO ==========
// Obtener perfil del usuario
router.get('/profile', (req, res) => {
  console.log('📋 Getting user profile...');
  forwardToClientService(req, res, '/api/clients/profile', 'GET');
});

// Actualizar perfil del usuario
router.put('/profile', (req, res) => {
  console.log('✏️ Updating user profile...');
  forwardToClientService(req, res, '/api/clients/profile', 'PUT');
});

// ========== RUTAS DE SERVICIOS ==========
// Rutas específicas para servicios de cliente
router.post('/services', (req, res) => {
  forwardToClientService(req, res, '/api/clients/services', 'POST');
});

router.get('/services', (req, res) => {
  forwardToClientService(req, res, '/api/clients/services', 'GET');
});

router.get('/services/:id', (req, res) => {
  forwardToClientService(req, res, `/api/clients/services/${req.params.id}`, 'GET');
});

export default router;