// EASYTRANS/client-service/index.js
// Tu configuración actualizada

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import clientRoutes from './routes/clientRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/clients', clientRoutes);
app.use('/api/users', clientRoutes); // Agregar esta línea para las rutas del perfil

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Client service running on port ${PORT}`);
});