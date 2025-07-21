-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS limonna;

-- Usar la base de datos creada
USE limonna;

-- Tabla Categoria
CREATE TABLE Categoria (
    ID_Categoria INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla Producto
CREATE TABLE Producto (
    ID_Producto INT PRIMARY KEY AUTO_INCREMENT,
    ID_Categoria INT,
    Nombre VARCHAR(100) NOT NULL,
    PrecioUnitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (ID_Categoria) REFERENCES Categoria(ID_Categoria)
);

-- Tabla Usuario
CREATE TABLE Usuario (
    DNI VARCHAR(20) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100) NOT NULL,
    CodigoMaster VARCHAR(50),
    NombreUsuario VARCHAR(50) UNIQUE NOT NULL,
    Email VARCHAR(100) UNIQUE,
    Activo BOOLEAN NOT NULL DEFAULT TRUE,
    esDueña BOOLEAN NOT NULL DEFAULT FALSE,
    esEmpleada BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tabla TipoTurno
CREATE TABLE TipoTurno (
    ID_TipoTurno INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL
);

-- Tabla Turno
CREATE TABLE Turno (
    ID_Turno INT PRIMARY KEY AUTO_INCREMENT,
    DNI VARCHAR(20),
    ID_TipoTurno INT,
    cajaChica DECIMAL(10, 2),
    Dia INT NOT NULL,
    Mes INT NOT NULL,
    Año INT NOT NULL,
    Horario TIME,
    FOREIGN KEY (DNI) REFERENCES Usuario(DNI),
    FOREIGN KEY (ID_TipoTurno) REFERENCES TipoTurno(ID_TipoTurno)
);

INSERT INTO TipoTurno (nombre) VALUES 
('mañana'),
('tarde'),
('1er turno media mañana'),
('2do turno media mañana'),
('1er turno media tarde'),
('2do turno media tarde');

SELECT * FROM TipoTurno;


-- Tabla Venta
CREATE TABLE Venta (
    ID_Venta INT PRIMARY KEY AUTO_INCREMENT,
    ID_Producto INT,
    DNI VARCHAR(20),
    ID_TipoPago INT,
    Dia INT NOT NULL,
    Mes INT NOT NULL,
    Año INT NOT NULL,
    Hora TIME,
    FOREIGN KEY (ID_Producto) REFERENCES Producto(ID_Producto),
    FOREIGN KEY (DNI) REFERENCES Usuario(DNI)
);