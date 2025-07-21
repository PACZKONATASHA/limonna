
ALTER TABLE Usuario
ADD COLUMN contrasena VARCHAR(255) NOT NULL;

DESCRIBE Usuario;

ALTER TABLE Usuario
DROP COLUMN Activo;

ALTER TABLE Venta
ADD COLUMN montoTotal DECIMAL(10,2);

AlTER TABLE Turno ADD COLUMN estado ENUM('activo','cerrado') DEFAULT 'activo';

ALTER TABLE Venta
  ADD COLUMN ID_TipoTurno INT AFTER ID_TipoPago,
  ADD CONSTRAINT fk_venta_tipoturno
         FOREIGN KEY (ID_TipoTurno) REFERENCES TipoTurno(ID_TipoTurno);



CREATE TABLE TipoPago (
    ID_TipoPago INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL
);



INSERT INTO TipoPago (ID_TipoPago, nombre) VALUES
(1, 'ferro'),
(2, 'efectivo'),
(3, 'transferencia');

-- Agregar la clave foránea para ID_TipoPago si no existe aún
ALTER TABLE Venta
ADD CONSTRAINT FK_Venta_TipoPago FOREIGN KEY (ID_TipoPago) REFERENCES TipoPago(ID_TipoPago);



INSERT INTO Categoria (nombre) VALUES
('nuez'),
('almendras'),
('quinoa'),
('semillas'),
('frutos secos');

INSERT INTO Producto (ID_Producto, ID_Categoria, Nombre, PrecioUnitario) VALUES
(101, 1, 'nuez', 150.00),
(102, 2, 'semilla', 250.00),
(103, 3, 'almendra', 500.00),
(104, 4, 'quimoa', 300.00),
(105, 5, 'frutos secos', 350.00);

INSERT INTO Usuario (DNI, Nombre, Apellido, CodigoMaster, NombreUsuario, Email, esDueña, esEmpleada,contrasena) VALUES
('10000001', 'Ana', 'Pérez', 'CM001', 'anap', 'ana@example.com', TRUE, TRUE, FALSE),
('10000002', 'Luis', 'Gómez', NULL, 'luisg', 'luis@example.com', TRUE, FALSE, TRUE),
('10000003', 'Marta', 'Rodríguez', NULL, 'martar', 'marta@example.com', TRUE, FALSE, TRUE),
('10000004', 'Carlos', 'Díaz', NULL, 'carlosd', 'carlos@example.com', TRUE, FALSE, TRUE),
('10000005', 'Laura', 'López', NULL, 'laural', 'laura@example.com', TRUE, FALSE, TRUE);

INSERT INTO Turno (DNI, ID_TipoTurno, cajaChica, Dia, Mes, Año, Horario) VALUES
('10000002', 1, 5000.00, 1, 5, 2025, '08:00:00'),
('10000003', 2, 3000.00, 2, 5, 2025, '14:00:00'),
('10000004', 3, 2000.00, 3, 5, 2025, '20:00:00'),
('10000005', 4, 4000.00, 4, 5, 2025, '10:00:00');

INSERT INTO Turno (DNI, ID_TipoTurno, cajaChica, Dia, Mes, Año, Horario) VALUES
('10000002', 1, 6000, 10, 5, 2025, '07:30'),
('10000003', 2, 3500, 10, 5, 2025, '11:30'),
('10000004', 3, 2500, 10, 5, 2025, '16:30'),
('10000005', 4, 4500, 10, 5, 2025, '20:30');


INSERT INTO Producto (ID_Producto, ID_Categoria, Nombre, PrecioUnitario) VALUES
(106, 1, 'frutos secos', 180.00),
(107, 1, 'castaña', 250.00),
(108, 1, 'lino', 170.00),
(109, 1, 'cebada', 300.00),
(110, 1, 'senteno', 800.00),
(111, 2, 'levadura', 220.00),
(112, 2, 'arroz', 190.00),
(113, 2, 'nuez', 250.00),
(114, 2, 'Maní Salado', 210.00),
(115, 2, 'Mix de Frutos Secos', 320.00),
(116, 3, 'aceitre de oliva', 120.00),
(117, 3, 'haria integral', 200.00),
(118, 3, 'harian de algarrobo', 180.00),
(119, 3, 'cesamo', 90.00),
(120, 3, 'aceitunas', 150.00),
(121, 4, 'nuez moscada', 450.00),
(122, 4, 'yogur griego', 230.00),
(123, 4, 'Torta de Vainilla', 600.00),
(124, 5, 'Yogur Bebible', 180.00),
(125, 5, 'imienta', 550.00);

-- Inserts para el 10 de mayo de 2025 (20 registros)
INSERT INTO Venta (ID_Producto, DNI, ID_TipoPago, ID_TipoTurno, Dia, Mes, Año, Hora) VALUES
(101, '10000001', 1, 2, 10, 5, 2025, '10:00:00'),
(102, '10000002', 2, 1, 10, 5, 2025, '10:15:00'),
(103, '10000003', 3, 3, 10, 5, 2025, '11:00:00'),
(104, '10000004', 1, 4, 10, 5, 2025, '11:30:00'),
(105, '10000005', 2, 2, 10, 5, 2025, '12:00:00'),
(106, '10000001', 3, 1, 10, 5, 2025, '12:45:00'),
(107, '10000002', 1, 4, 10, 5, 2025, '13:15:00'),
(108, '10000003', 2, 3, 10, 5, 2025, '13:45:00'),
(109, '10000004', 3, 2, 10, 5, 2025, '14:00:00'),
(110, '10000005', 1, 1, 10, 5, 2025, '14:30:00'),
(111, '10000001', 2, 3, 10, 5, 2025, '15:00:00'),
(112, '10000002', 3, 2, 10, 5, 2025, '15:30:00'),
(113, '10000003', 1, 4, 10, 5, 2025, '16:00:00'),
(114, '10000004', 2, 1, 10, 5, 2025, '16:30:00'),
(115, '10000005', 3, 3, 10, 5, 2025, '17:00:00'),
(116, '10000001', 1, 2, 10, 5, 2025, '17:30:00'),
(117, '10000002', 2, 4, 10, 5, 2025, '18:00:00'),
(118, '10000003', 3, 1, 10, 5, 2025, '18:30:00'),
(119, '10000004', 1, 3, 10, 5, 2025, '19:00:00'),
(120, '10000005', 2, 2, 10, 5, 2025, '19:30:00');

-- Otros 30 registros con fechas aleatorias de 2025
INSERT INTO Venta (ID_Producto, DNI, ID_TipoPago, ID_TipoTurno, Dia, Mes, Año, Hora) VALUES
(121, '10000001', 3, 1, 1, 6, 2025, '10:00:00'),
(122, '10000002', 2, 3, 2, 6, 2025, '10:30:00'),
(123, '10000003', 1, 4, 3, 6, 2025, '11:00:00'),
(124, '10000004', 3, 2, 4, 6, 2025, '11:30:00'),
(125, '10000005', 2, 1, 5, 6, 2025, '12:00:00'),
(101, '10000001', 1, 3, 6, 6, 2025, '12:30:00'),
(102, '10000002', 2, 4, 7, 6, 2025, '13:00:00'),
(103, '10000003', 3, 1, 8, 6, 2025, '13:30:00'),
(104, '10000004', 1, 2, 9, 6, 2025, '14:00:00'),
(105, '10000005', 2, 3, 10, 6, 2025, '14:30:00'),
(106, '10000001', 3, 4, 11, 6, 2025, '15:00:00'),
(107, '10000002', 1, 1, 12, 6, 2025, '15:30:00'),
(108, '10000003', 2, 2, 13, 6, 2025, '16:00:00'),
(109, '10000004', 3, 3, 14, 6, 2025, '16:30:00'),
(110, '10000005', 1, 4, 15, 6, 2025, '17:00:00'),
(111, '10000001', 2, 1, 16, 6, 2025, '17:30:00'),
(112, '10000002', 3, 2, 17, 6, 2025, '18:00:00'),
(113, '10000003', 1, 3, 18, 6, 2025, '18:30:00'),
(114, '10000004', 2, 4, 19, 6, 2025, '19:00:00'),
(115, '10000005', 3, 1, 20, 6, 2025, '19:30:00'),
(116, '10000001', 1, 2, 21, 6, 2025, '20:00:00'),
(117, '10000002', 2, 3, 22, 6, 2025, '20:30:00'),
(118, '10000003', 3, 4, 23, 6, 2025, '21:00:00'),
(119, '10000004', 1, 1, 24, 6, 2025, '21:30:00'),
(120, '10000005', 2, 2, 25, 6, 2025, '22:00:00'),
(121, '10000001', 3, 3, 26, 6, 2025, '22:30:00'),
(122, '10000002', 1, 4, 27, 6, 2025, '23:00:00'),
(123, '10000003', 2, 1, 28, 6, 2025, '23:30:00'),
(124, '10000004', 3, 2, 29, 6, 2025, '00:00:00'),
(125, '10000005', 1, 3, 30, 6, 2025, '00:30:00');
