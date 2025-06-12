-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS easytrans;
USE easytrans;

-- Tabla de usuarios (compartida por clientes y conductores)
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    tipo ENUM('cliente', 'conductor') NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    documento_identidad VARCHAR(50) UNIQUE NOT NULL,
    verificado BOOLEAN DEFAULT FALSE
);

-- Tabla de conductores (extiende la información de usuario)
CREATE TABLE conductor (
    id_conductor INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL,
    licencia_conducir VARCHAR(50) UNIQUE NOT NULL,
    tipo_licencia VARCHAR(20) NOT NULL,
    fecha_vencimiento_licencia DATE NOT NULL,
    antiguedad_conduccion INT NOT NULL COMMENT 'Años de experiencia conduciendo',
    vehiculo_asignado VARCHAR(100),
    tipo_vehiculo ENUM('Camion', 'Furgon', 'Tractomula', 'CarroTanque'),
    capacidad_carga DECIMAL(10,2) COMMENT 'Capacidad en kilogramos',
    disponibilidad ENUM('disponible', 'ocupado', 'inactivo') DEFAULT 'disponible',
    calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Tabla de servicios (envíos de carga)
CREATE TABLE servicio (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_cliente INT NOT NULL,
    id_conductor INT,
    descripcion_carga VARCHAR(255) NOT NULL,
    tipo_carga ENUM('paquete', 'mueble', 'electrodomestico', 'alimentos', 'carga_peligrosa') NOT NULL,
    peso DECIMAL(10,2) NOT NULL COMMENT 'Peso en kilogramos',
    dimensiones VARCHAR(50) COMMENT 'Formato: Largo x Ancho x Alto (cm)',
    direccion_recogida VARCHAR(255) NOT NULL,
    direccion_entrega VARCHAR(255) NOT NULL,
    fecha_recogida DATETIME NOT NULL,
    fecha_entrega_estimada DATETIME,
    estado ENUM('pendiente', 'aceptado', 'en_proceso', 'completado', 'cancelado') DEFAULT 'pendiente',
    precio DECIMAL(10,2) NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_aceptacion DATETIME,
    fecha_completado DATETIME,
    calificacion_cliente INT CHECK (calificacion_cliente BETWEEN 1 AND 5),
    calificacion_conductor INT CHECK (calificacion_conductor BETWEEN 1 AND 5),
    comentarios TEXT,
    FOREIGN KEY (id_usuario_cliente) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_conductor) REFERENCES conductor(id_conductor)
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_tipo ON usuario(tipo);
CREATE INDEX idx_conductor_disponibilidad ON conductor(disponibilidad);
CREATE INDEX idx_servicio_estado ON servicio(estado);
CREATE INDEX idx_servicio_fechas ON servicio(fecha_recogida, fecha_entrega_estimada);

-- Procedimiento para actualizar la calificación promedio del conductor
DELIMITER //
CREATE PROCEDURE actualizar_calificacion_conductor(IN conductor_id INT)
BEGIN
    DECLARE avg_calificacion DECIMAL(3,2);
    
    SELECT AVG(calificacion_conductor) INTO avg_calificacion
    FROM servicio
    WHERE id_conductor = conductor_id AND calificacion_conductor IS NOT NULL;
    
    UPDATE conductor
    SET calificacion_promedio = IFNULL(avg_calificacion, 0)
    WHERE id_conductor = conductor_id;
END //
DELIMITER ;

-- Trigger para actualizar calificación cuando se añade una nueva
DELIMITER //
CREATE TRIGGER after_calificacion_insert
AFTER UPDATE ON servicio
FOR EACH ROW
BEGIN
    IF NEW.calificacion_conductor IS NOT NULL AND NEW.calificacion_conductor <> OLD.calificacion_conductor THEN
        CALL actualizar_calificacion_conductor(NEW.id_conductor);
    END IF;
END //
DELIMITER ;