import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Log para debug
router.use((req, res, next) => {
  console.log(`Driver Route: ${req.method} ${req.originalUrl}`);
  next();
});

// Todas las rutas requieren autenticación
router.use(authenticate);

const driverServiceProxy = createProxyMiddleware({
  target: process.env.DRIVER_SERVICE_URL || 'http://localhost:4003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/drivers': '/api/drivers'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying to: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('Driver Service Proxy Error:', err.message);
    res.status(500).json({ 
      error: 'Driver Service unavailable',
      details: err.message,
      target: process.env.DRIVER_SERVICE_URL || 'http://localhost:4003'
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Proxy response: ${proxyRes.statusCode} for ${req.originalUrl}`);
  }
});

router.use(driverServiceProxy);

export default router;