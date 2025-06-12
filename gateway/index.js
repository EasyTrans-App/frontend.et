// EASYTRANS/gateway/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import driverRoutes from './routes/driverRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3100', // Puerto del frontend React
  credentials: true
}));

// IMPORTANTE: JSON parser ANTES de las rutas
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log de todas las requests
app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', req.body);
  }
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', clientRoutes);  // ⭐ IMPORTANTE: Esta línea hace que /api/users use las mismas rutas de clientRoutes
app.use('/api/drivers', driverRoutes);

// Health check del gateway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'Gateway OK',
    timestamp: new Date().toISOString(),
    services: {
      auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
      client: process.env.CLIENT_SERVICE_URL || 'http://localhost:4002',
      driver: process.env.DRIVER_SERVICE_URL || 'http://localhost:4003'
    }
  });
});

// Test route para verificar conectividad
app.get('/api/test', (req, res) => {
  res.json({ message: 'Gateway funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ [GATEWAY ERROR]:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del gateway',
    message: err.message 
  });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  console.log(`❓ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Gateway running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth service: ${process.env.AUTH_SERVICE_URL || 'http://localhost:4001'}`);
  console.log(`👥 Client service: ${process.env.CLIENT_SERVICE_URL || 'http://localhost:4002'}`);
  console.log(`🚚 Driver service: ${process.env.DRIVER_SERVICE_URL || 'http://localhost:4003'}`);
});