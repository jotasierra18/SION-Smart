/*
# Esquema inicial - SION S-MART

1. New Tables
- `user` - Usuarios del sistema (Better Auth)
- `session` - Sesiones de usuario (Better Auth)
- `account` - Cuentas de usuario (Better Auth)
- `verification` - Verificaciones (Better Auth)
- `clients` - Clientes registrados
- `service_types` - Tipos de servicio
- `drones` - Drones de la flota
- `service_requests` - Solicitudes de servicio

2. Security
- Enable RLS on app tables.
- Allow authenticated users CRUD access.
*/

-- Better Auth tables
CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  image text,
  role text NOT NULL DEFAULT 'operator',
  identificacion text,
  certificacion text,
  "horasExperiencia" decimal(10,2),
  "vigenciaMedica" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session (
  id text PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  token text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  scope text,
  password text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);

-- App tables
CREATE TABLE IF NOT EXISTS clients (
  id serial PRIMARY KEY,
  "userId" text REFERENCES "user"(id) ON DELETE SET NULL,
  "tipoCliente" text DEFAULT 'natural',
  "idInterno" text,
  "tipoDocumento" text,
  "numeroDocumento" text,
  "nombreCompleto" text,
  phone text,
  whatsapp text,
  email text NOT NULL,
  address text,
  city text,
  departamento text,
  pais text,
  "rutPersonal" text,
  "razonSocial" text,
  nit text,
  "representanteLegal" text,
  "cargoContacto" text,
  "correoCorporativo" text,
  "telefonoCorporativo" text,
  "direccionFacturacion" text,
  "regimenTributario" text,
  "rutEmpresa" text,
  "fechaRegistro" timestamp DEFAULT now(),
  "canalAdquisicion" text,
  "asesorComercial" text,
  "estadoCliente" text DEFAULT 'activo',
  observaciones text,
  "companyName" text NOT NULL DEFAULT 'N/A',
  "contactName" text NOT NULL DEFAULT 'N/A',
  state text,
  notes text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_types (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drones (
  id serial PRIMARY KEY,
  nombre text,
  "codigoInterno" text,
  marca text,
  model text NOT NULL,
  "serialNumber" text NOT NULL UNIQUE,
  "fechaCompra" timestamp,
  status text NOT NULL DEFAULT 'available',
  "ubicacionActual" text,
  "imagenDrone" text,
  peso decimal(10,2),
  "velocidadMaxima" decimal(10,2),
  "altitudMaxima" decimal(10,2),
  "resistenciaViento" text,
  "temperaturaOperativa" text,
  "tiempoMaximoVuelo" decimal(10,2),
  "capacidadTanque" decimal(10,2),
  presion decimal(10,2),
  "tipoBoquilla" text,
  alcance decimal(10,2),
  "tipoProducto" text,
  "capacidadBaterias" text,
  "lastMaintenanceDate" timestamp,
  "proximoMantenimiento" timestamp,
  notes text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_requests (
  id serial PRIMARY KEY,
  "clientId" integer NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  "serviceTypeId" integer REFERENCES service_types(id) ON DELETE SET NULL,
  "droneId" integer REFERENCES drones(id) ON DELETE SET NULL,
  "assignedUserId" text REFERENCES "user"(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  "scheduledDate" timestamp,
  "completedDate" timestamp,
  location text,
  coordinates text,
  area decimal(10,2),
  notes text,
  "totalPrice" decimal(10,2),
  departamento text,
  altitud decimal(10,2),
  "tipoZona" text,
  "distanciaAeropuerto" decimal(10,2),
  "restriccionAerea" text,
  "estadoPermisoAerocivil" text,
  "tipoSuperficie" text,
  "areaTotalM2" decimal(12,2),
  "alturaMaxima" decimal(10,2),
  "cantidadNiveles" integer,
  "tipoSuciedad" text,
  "nivelContaminacion" text,
  "frecuenciaLimpieza" text,
  "fechaEstimada" timestamp,
  prioridad text,
  "estadoOperativo" text,
  "horasEstimadasVuelo" decimal(8,2),
  "cantidadAguaRequerida" decimal(10,2),
  "cantidadQuimico" decimal(10,2),
  "numeroBaterias" integer,
  "numeroOperadores" integer,
  "riesgoOperacional" text,
  "horaInicio" timestamp,
  "horaFinalizacion" timestamp,
  "tiempoTotalVuelo" decimal(10,2),
  "consumoAgua" decimal(10,2),
  "distanciaRecorrida" decimal(10,2),
  "alturaMaximaRegistrada" decimal(10,2),
  "velocidadPromedio" decimal(10,2),
  "consumoBateria" decimal(10,2),
  "numeroCiclos" integer,
  "imagenPlano" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Policies for clients
DROP POLICY IF EXISTS "select_clients" ON clients;
CREATE POLICY "select_clients" ON clients FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_clients" ON clients;
CREATE POLICY "insert_clients" ON clients FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_clients" ON clients;
CREATE POLICY "update_clients" ON clients FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_clients" ON clients;
CREATE POLICY "delete_clients" ON clients FOR DELETE
TO authenticated USING (true);

-- Policies for service_types
DROP POLICY IF EXISTS "select_service_types" ON service_types;
CREATE POLICY "select_service_types" ON service_types FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_service_types" ON service_types;
CREATE POLICY "insert_service_types" ON service_types FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_service_types" ON service_types;
CREATE POLICY "update_service_types" ON service_types FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_service_types" ON service_types;
CREATE POLICY "delete_service_types" ON service_types FOR DELETE
TO authenticated USING (true);

-- Policies for drones
DROP POLICY IF EXISTS "select_drones" ON drones;
CREATE POLICY "select_drones" ON drones FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_drones" ON drones;
CREATE POLICY "insert_drones" ON drones FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_drones" ON drones;
CREATE POLICY "update_drones" ON drones FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_drones" ON drones;
CREATE POLICY "delete_drones" ON drones FOR DELETE
TO authenticated USING (true);

-- Policies for service_requests
DROP POLICY IF EXISTS "select_service_requests" ON service_requests;
CREATE POLICY "select_service_requests" ON service_requests FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_service_requests" ON service_requests;
CREATE POLICY "insert_service_requests" ON service_requests FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_service_requests" ON service_requests;
CREATE POLICY "update_service_requests" ON service_requests FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_service_requests" ON service_requests;
CREATE POLICY "delete_service_requests" ON service_requests FOR DELETE
TO authenticated USING (true);
