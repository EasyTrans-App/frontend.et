import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
console.log('🔧 Creating auth proxy with target:', AUTH_SERVICE_URL);

const authServiceProxy = createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  // ESTO ES CLAVE: Remover /api/auth del path antes de enviarlo al microservicio
  pathRewrite: {
    '^/api/auth': '', // /api/auth/register -> /register
  },
  timeout: 10000,
  proxyTimeout: 10000,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 [PROXY] Original: ${req.method} ${req.originalUrl}`);
    console.log(`🔄 [PROXY] Rewritten: ${req.method} -> ${AUTH_SERVICE_URL}${proxyReq.path}`);
    
    // Asegurar que el contenido se envíe correctamente
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
      console.log(`🔄 [PROXY] Body sent:`, req.body);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ [PROXY RESPONSE] ${proxyRes.statusCode} for ${req.originalUrl}`);
  },
  onError: (err, req, res) => {
    console.error('❌ [PROXY ERROR]:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Auth Service unavailable', 
        details: err.message,
        target: AUTH_SERVICE_URL 
      });
    }
  }
});

// Usar el proxy para todas las rutas
router.use('/', authServiceProxy);

console.log('✅ Auth router configured with pathRewrite');

export default router;