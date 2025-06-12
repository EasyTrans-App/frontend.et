//Ruta: EASYTRANS/driver-service/controllers/driverController.js
import db from '../models/driverModel.js';

export const getAvailableServices = async (req, res) => {
  try {
    const [services] = await db.query(
      `SELECT 
        s.id_servicio,
        s.descripcion_carga,
        s.tipo_carga,
        s.peso,
        s.dimensiones,
        s.direccion_recogida,
        s.direccion_entrega,
        s.distancia_km,
        s.precio,
        s.fecha_creacion,
        u.nombre AS cliente_nombre,
        u.apellido AS cliente_apellido,
        u.telefono AS cliente_telefono
      FROM servicio s
      JOIN usuario u ON s.id_usuario_cliente = u.id_usuario
      WHERE s.estado = 'pendiente'
      ORDER BY s.fecha_creacion DESC`
    );
    res.json(services);
  } catch (error) {
    console.error('Error al obtener servicios disponibles:', error);
    res.status(500).json({ error: 'Error al obtener servicios disponibles' });
  }
};

export const respondToService = async (req, res) => {
  try {
    const { id_usuario } = req.user; // Cambiado de id_conductor a id_usuario
    const { id_servicio } = req.params;
    const { accion } = req.body; // 'aceptar' o 'rechazar'

    console.log('Datos recibidos:', { id_usuario, id_servicio, accion });

    if (!['aceptar', 'rechazar'].includes(accion)) {
      return res.status(400).json({ error: 'Acción no válida' });
    }

    // Verificar que el servicio existe y está pendiente
    const [services] = await db.query(
      'SELECT * FROM servicio WHERE id_servicio = ? AND estado = ?',
      [id_servicio, 'pendiente']
    );

    if (services.length === 0) {
      return res.status(404).json({ error: 'Servicio no disponible' });
    }

    if (accion === 'aceptar') {
      // Al aceptar: cambiar a 'aceptado' y asignar conductor
      await db.query(
        `UPDATE servicio 
         SET estado = 'aceptado', 
             id_conductor = ?, 
             fecha_aceptacion = NOW()
         WHERE id_servicio = ?`,
        [id_usuario, id_servicio]
      );

      res.json({ 
        message: 'Servicio aceptado correctamente',
        estado: 'aceptado'
      });
    } else {
      // Al rechazar: cambiar a 'cancelado' sin asignar conductor
      await db.query(
        `UPDATE servicio 
         SET estado = 'cancelado'
         WHERE id_servicio = ?`,
        [id_servicio]
      );

      res.json({ 
        message: 'Servicio rechazado correctamente',
        estado: 'cancelado'
      });
    }
  } catch (error) {
    console.error('Error al responder al servicio:', error);
    res.status(500).json({ error: 'Error al responder al servicio' });
  }
};

export const updateServiceStatus = async (req, res) => {
  try {
    const { id_usuario } = req.user; // Cambiado de id_conductor a id_usuario
    const { id_servicio } = req.params;
    const { estado } = req.body; // 'en_proceso' o 'completado'

    if (!['en_proceso', 'completado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    // Verificar que el conductor es el asignado al servicio
    const [services] = await db.query(
      'SELECT * FROM servicio WHERE id_servicio = ? AND id_conductor = ?',
      [id_servicio, id_usuario]
    );

    if (services.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado o no asignado' });
    }

    const estadoActual = services[0].estado;
    
    // Validar transiciones permitidas
    const transicionesPermitidas = {
      'aceptado': ['en_proceso'],
      'en_proceso': ['completado']
    };

    if (!transicionesPermitidas[estadoActual]?.includes(estado)) {
      return res.status(400).json({ 
        error: `No se puede cambiar de ${estadoActual} a ${estado}` 
      });
    }

    // Actualizar el estado
    if (estado === 'completado') {
      await db.query(
        `UPDATE servicio 
         SET estado = ?, fecha_completado = NOW()
         WHERE id_servicio = ?`,
        [estado, id_servicio]
      );
    } else {
      await db.query(
        `UPDATE servicio 
         SET estado = ?
         WHERE id_servicio = ?`,
        [estado, id_servicio]
      );
    }

    res.json({ 
      message: `Estado del servicio actualizado a ${estado}`,
      nuevo_estado: estado
    });
  } catch (error) {
    console.error('Error al actualizar estado del servicio:', error);
    res.status(500).json({ error: 'Error al actualizar estado del servicio' });
  }
};

export const getDriverServices = async (req, res) => {
  try {
    const { id_usuario } = req.user; // Cambiado de id_conductor a id_usuario
    
    const [services] = await db.query(
      `SELECT 
        s.id_servicio,
        s.descripcion_carga,
        s.tipo_carga,
        s.estado,
        s.direccion_recogida,
        s.direccion_entrega,
        s.fecha_recogida,
        s.fecha_entrega_estimada,
        s.precio,
        s.fecha_creacion,
        s.peso,
        s.dimensiones,
        s.distancia_km,
        u.nombre AS cliente_nombre,
        u.apellido AS cliente_apellido,
        u.telefono AS cliente_telefono
      FROM servicio s
      JOIN usuario u ON s.id_usuario_cliente = u.id_usuario
      WHERE s.id_conductor = ? 
        AND s.estado IN ('aceptado', 'en_proceso', 'completado')
      ORDER BY 
        CASE s.estado
          WHEN 'aceptado' THEN 1
          WHEN 'en_proceso' THEN 2
          WHEN 'completado' THEN 3
          ELSE 4
        END,
        s.fecha_creacion DESC`,
      [id_usuario]
    );

    res.json(services);
  } catch (error) {
    console.error('Error al obtener servicios del conductor:', error);
    res.status(500).json({ error: 'Error al obtener servicios del conductor' });
  }
};