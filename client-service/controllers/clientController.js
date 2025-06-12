import db from '../models/clientModel.js';
import bcrypt from 'bcryptjs';

// Precio base y tarifas (pueden moverse a configuración)
const PRECIO_BASE = 5000; // Precio base en moneda local
const TARIFA_POR_KM = 800; // Costo por kilómetro
const TARIFA_POR_KG = 50; // Costo por kilogramo

export const createService = async (req, res) => {
  console.log('👉 req.user:', req.user); // <--- AÑADE ESTO
  try {
    console.log('🧾 Usuario autenticado:', req.user); // ← Agrega esto
    const { id: id_usuario_cliente } = req.user;
    const {
      descripcion_carga,
      tipo_carga,
      peso,
      dimensiones,
      direccion_recogida,
      direccion_entrega,
      distancia_km
    } = req.body;

    // Validaciones básicas
    if (!descripcion_carga || !tipo_carga || !peso || !direccion_recogida || !direccion_entrega || !distancia_km) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Calcular precio estimado
    const precio_estimado = PRECIO_BASE + 
                          (distancia_km * TARIFA_POR_KM) + 
                          (peso * TARIFA_POR_KG);

    // Insertar servicio
    const [result] = await db.query(
      `INSERT INTO servicio 
      (id_usuario_cliente, descripcion_carga, tipo_carga, peso, dimensiones, 
       direccion_recogida, direccion_entrega, distancia_km, precio, estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [
        id_usuario_cliente,
        descripcion_carga,
        tipo_carga,
        peso,
        dimensiones,
        direccion_recogida,
        direccion_entrega,
        distancia_km,
        precio_estimado
      ]
    );

    res.status(201).json({
      message: 'Servicio creado exitosamente',
      id_servicio: result.insertId,
      precio_estimado
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ error: 'Error al crear el servicio' });
  }
};

export const getServicesByClient = async (req, res) => {
  try {
    const id_usuario_cliente = req.user.id || req.user.id_usuario || req.user.id_usuario_cliente;

    const [services] = await db.query(
      `SELECT 
        id_servicio,
        descripcion_carga,
        tipo_carga,
        peso,
        dimensiones,
        direccion_recogida,
        direccion_entrega,
        distancia_km,
        precio,
        estado,
        fecha_creacion
      FROM servicio 
      WHERE id_usuario_cliente = ? 
      ORDER BY fecha_creacion DESC`,
      [id_usuario_cliente]
    );

    res.json(services);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ error: 'Error al obtener los servicios' });
  }
};

export const getServiceDetails = async (req, res) => {
  try {
    const { id_usuario_cliente } = req.user;
    const { id } = req.params;

    const [services] = await db.query(
      `SELECT 
        s.*,
        c.nombre AS conductor_nombre,
        c.apellido AS conductor_apellido,
        c.licencia_conducir,
        c.vehiculo_asignado
      FROM servicio s
      LEFT JOIN conductor c ON s.id_conductor = c.id_conductor
      WHERE s.id_servicio = ? AND s.id_usuario_cliente = ?`,
      [id, id_usuario_cliente]
    );

    if (services.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json(services[0]);
  } catch (error) {
    console.error('Error al obtener detalles del servicio:', error);
    res.status(500).json({ error: 'Error al obtener detalles del servicio' });
  }
};


// Obtener perfil del usuario
export const getUserProfile = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    const [users] = await db.query(
      `SELECT 
        id_usuario,
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        documento_identidad,
        fecha_registro
      FROM usuario 
      WHERE id_usuario = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el perfil del usuario'
    });
  }
};

// Actualizar perfil del usuario
export const updateUserProfile = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      documento_identidad,
      password
    } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !email || !telefono || !documento_identidad) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos obligatorios deben ser completados'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'El formato del email no es válido'
      });
    }

    // Verificar si el email ya existe (excluyendo el usuario actual)
    const [existingUsers] = await db.query(
      'SELECT id_usuario FROM usuario WHERE email = ? AND id_usuario != ?',
      [email, userId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado por otro usuario'
      });
    }

    // Preparar datos para actualizar
    let updateFields = [
      'nombre = ?',
      'apellido = ?',
      'email = ?',
      'telefono = ?',
      'direccion = ?',
      'documento_identidad = ?'
    ];
    
    let updateValues = [
      nombre,
      apellido,
      email,
      telefono,
      direccion || null,
      documento_identidad
    ];

    // Si se incluye password, agregarlo a la actualización
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres'
        });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    // Agregar el ID del usuario al final para la cláusula WHERE
    updateValues.push(userId);

    // Ejecutar la actualización
    const [result] = await db.query(
      `UPDATE usuario SET ${updateFields.join(', ')} WHERE id_usuario = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Obtener los datos actualizados del usuario
    const [updatedUser] = await db.query(
      `SELECT 
        id_usuario,
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        documento_identidad,
        fecha_registro
      FROM usuario 
      WHERE id_usuario = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el perfil'
    });
  }
};