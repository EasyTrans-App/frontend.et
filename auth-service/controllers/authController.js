import db from '../models/authModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, direccion, tipo, documento_identidad } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !apellido || !email || !password || !telefono || !direccion || !documento_identidad) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    await db.query(
      `INSERT INTO usuario 
      (nombre, apellido, email, password, telefono, direccion, tipo, documento_identidad) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
      [nombre, apellido, email, hashed, telefono, direccion, tipo || 'cliente', documento_identidad]
    );
    
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error en registro:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El email o documento ya está registrado' });
    }
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const [rows] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
    const user = rows[0];
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id_usuario, email: user.email, tipo: user.tipo }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.json({ 
      token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        tipo: user.tipo
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};