directory/schema.sql-- Director CRM Database Schema
-- Issue: #3 - feat(directory): Integrate CRM Director database with SAM-v3.0
-- Version: 1.0
-- Created: 2025-12-17

CREATE TABLE IF NOT EXISTS directores (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    apellido_1 VARCHAR(255),
    apellido_2 VARCHAR(255),
    institucion VARCHAR(500) NOT NULL,
    especialidad VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(20),
    linkedin VARCHAR(500),
    region VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'Chile',
    confianza FLOAT DEFAULT 0.0 CHECK (confianza >= 0 AND confianza <= 100),
    fuente VARCHAR(50) DEFAULT 'OSINT',
    estado ENUM('activo', 'inactivo', 'verificado', 'pendiente') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notas TEXT,
    UNIQUE KEY uk_nombre_institucion (nombre, institucion),
    INDEX idx_institucion (institucion),
    INDEX idx_especialidad (especialidad),
    INDEX idx_estado (estado),
    INDEX idx_confianza (confianza)
);

CREATE TABLE IF NOT EXISTS director_contactos (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    director_id INTEGER NOT NULL,
    tipo_contacto ENUM('email', 'telefono', 'linkedin', 'otro') NOT NULL,
    valor VARCHAR(500) NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    fecha_verificacion TIMESTAMP,
    FOREIGN KEY (director_id) REFERENCES directores(id) ON DELETE CASCADE,
    UNIQUE KEY uk_director_contacto (director_id, tipo_contacto, valor)
);

CREATE TABLE IF NOT EXISTS director_historial (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    director_id INTEGER NOT NULL,
    accion VARCHAR(100),
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id VARCHAR(255),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (director_id) REFERENCES directores(id) ON DELETE CASCADE,
    INDEX idx_director_id (director_id),
    INDEX idx_fecha_cambio (fecha_cambio)
);

-- Insertar datos iniciales de prueba
INSERT IGNORE INTO directores 
    (nombre, apellido_1, apellido_2, institucion, especialidad, email, telefono, linkedin, region, confianza, estado)
VALUES
    ('Carlos', 'Vergara', 'Chile', 'Instituto TI', 'Tecnología Educativa', 'carlos@instituti.edu', '+56 9 1234 5678', 'linkedin.com/in/carlosvergara', 'Metropolitana', 95.0, 'verificado'),
    ('Gastón', 'Martinez', 'Labra', 'Instituto TI', 'Directivo Académico', 'gaston@instituti.edu', '+56 9 8765 4321', 'linkedin.com/in/gastonmartinez', 'Metropolitana', 90.0, 'verificado'),
    ('Jeanette', 'Figueroa', NULL, 'Diplomado Salud', 'Gestión Educativa Salud', 'jeanette@healthdiploma.edu', '+56 9 3333 4444', 'linkedin.com/in/jeanettefigueroa', 'Metropolitana', 88.0, 'verificado');

-- Crear índices adicionales para búsquedas frecuentes
CREATE INDEX idx_busqueda_general ON directores (nombre, institucion, especialidad);
CREATE INDEX idx_contacto_email ON director_contactos (valor) WHERE tipo_contacto = 'email';
