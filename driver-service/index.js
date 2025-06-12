import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import driverRoutes from './routes/driverRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/drivers', driverRoutes);

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
  console.log(`Driver service running on port ${PORT}`);
});