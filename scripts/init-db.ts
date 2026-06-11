import Database from 'better-sqlite3'

const db = new Database('./local.db')

db.exec(`
-- User table
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  role TEXT NOT NULL DEFAULT 'operator',
  identificacion TEXT,
  certificacion TEXT,
  horasExperiencia REAL,
  vigenciaMedica INTEGER,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Session table
CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  expiresAt INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);

-- Account table
CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope TEXT,
  password TEXT,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Verification table
CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER DEFAULT (unixepoch() * 1000),
  updatedAt INTEGER DEFAULT (unixepoch() * 1000)
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT REFERENCES user(id) ON DELETE SET NULL,
  tipoCliente TEXT DEFAULT 'natural',
  idInterno TEXT,
  tipoDocumento TEXT,
  numeroDocumento TEXT,
  nombreCompleto TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT NOT NULL,
  address TEXT,
  city TEXT,
  departamento TEXT,
  pais TEXT,
  rutPersonal TEXT,
  razonSocial TEXT,
  nit TEXT,
  representanteLegal TEXT,
  cargoContacto TEXT,
  correoCorporativo TEXT,
  telefonoCorporativo TEXT,
  direccionFacturacion TEXT,
  regimenTributario TEXT,
  rutEmpresa TEXT,
  fechaRegistro INTEGER DEFAULT (unixepoch() * 1000),
  canalAdquisicion TEXT,
  asesorComercial TEXT,
  estadoCliente TEXT DEFAULT 'activo',
  observaciones TEXT,
  companyName TEXT NOT NULL DEFAULT 'N/A',
  contactName TEXT NOT NULL DEFAULT 'N/A',
  state TEXT,
  notes TEXT,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Service types table
CREATE TABLE IF NOT EXISTS service_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Drones table
CREATE TABLE IF NOT EXISTS drones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  codigoInterno TEXT,
  marca TEXT,
  model TEXT NOT NULL,
  serialNumber TEXT NOT NULL UNIQUE,
  fechaCompra INTEGER,
  status TEXT NOT NULL DEFAULT 'available',
  ubicacionActual TEXT,
  imagenDrone TEXT,
  peso REAL,
  velocidadMaxima REAL,
  altitudMaxima REAL,
  resistenciaViento TEXT,
  temperaturaOperativa TEXT,
  tiempoMaximoVuelo REAL,
  capacidadTanque REAL,
  presion REAL,
  tipoBoquilla TEXT,
  alcance REAL,
  tipoProducto TEXT,
  capacidadBaterias TEXT,
  lastMaintenanceDate INTEGER,
  proximoMantenimiento INTEGER,
  notes TEXT,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Service requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clientId INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  serviceTypeId INTEGER REFERENCES service_types(id) ON DELETE SET NULL,
  droneId INTEGER REFERENCES drones(id) ON DELETE SET NULL,
  assignedUserId TEXT REFERENCES user(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduledDate INTEGER,
  completedDate INTEGER,
  location TEXT,
  coordinates TEXT,
  area REAL,
  notes TEXT,
  totalPrice REAL,
  departamento TEXT,
  altitud REAL,
  tipoZona TEXT,
  distanciaAeropuerto REAL,
  restriccionAerea TEXT,
  estadoPermisoAerocivil TEXT,
  tipoSuperficie TEXT,
  areaTotalM2 REAL,
  alturaMaxima REAL,
  cantidadNiveles INTEGER,
  tipoSuciedad TEXT,
  nivelContaminacion TEXT,
  frecuenciaLimpieza TEXT,
  fechaEstimada INTEGER,
  prioridad TEXT,
  estadoOperativo TEXT,
  horasEstimadasVuelo REAL,
  cantidadAguaRequerida REAL,
  cantidadQuimico REAL,
  numeroBaterias INTEGER,
  numeroOperadores INTEGER,
  riesgoOperacional TEXT,
  horaInicio INTEGER,
  horaFinalizacion INTEGER,
  tiempoTotalVuelo REAL,
  consumoAgua REAL,
  distanciaRecorrida REAL,
  alturaMaximaRegistrada REAL,
  velocidadPromedio REAL,
  consumoBateria REAL,
  numeroCiclos INTEGER,
  imagenPlano TEXT,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
`)

console.log('Database initialized successfully')
