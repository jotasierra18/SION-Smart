import { pgTable, text, integer, serial, timestamp, decimal, boolean } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('operator'),
  identificacion: text('identificacion'),
  certificacion: text('certificacion'),
  horasExperiencia: decimal('horasExperiencia', { precision: 10, scale: 2 }),
  vigenciaMedica: timestamp('vigenciaMedica', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { mode: 'date' }),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { mode: 'date' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
})

// --- App tables ------------------------------------------------------------

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  userId: text('userId').references(() => user.id, { onDelete: 'set null' }),
  tipoCliente: text('tipoCliente').default('natural'),
  idInterno: text('idInterno'),
  tipoDocumento: text('tipoDocumento'),
  numeroDocumento: text('numeroDocumento'),
  nombreCompleto: text('nombreCompleto'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  email: text('email').notNull(),
  address: text('address'),
  city: text('city'),
  departamento: text('departamento'),
  pais: text('pais'),
  rutPersonal: text('rutPersonal'),
  razonSocial: text('razonSocial'),
  nit: text('nit'),
  representanteLegal: text('representanteLegal'),
  cargoContacto: text('cargoContacto'),
  correoCorporativo: text('correoCorporativo'),
  telefonoCorporativo: text('telefonoCorporativo'),
  direccionFacturacion: text('direccionFacturacion'),
  regimenTributario: text('regimenTributario'),
  rutEmpresa: text('rutEmpresa'),
  fechaRegistro: timestamp('fechaRegistro', { mode: 'date' }).defaultNow(),
  canalAdquisicion: text('canalAdquisicion'),
  asesorComercial: text('asesorComercial'),
  estadoCliente: text('estadoCliente').default('activo'),
  observaciones: text('observaciones'),
  companyName: text('companyName').notNull().default('N/A'),
  contactName: text('contactName').notNull().default('N/A'),
  state: text('state'),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
})

export const serviceTypes = pgTable('service_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  basePrice: decimal('basePrice', { precision: 10, scale: 2 }),
  estimatedDuration: integer('estimatedDuration'),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
})

export const drones = pgTable('drones', {
  id: serial('id').primaryKey(),
  nombre: text('nombre'),
  codigoInterno: text('codigoInterno'),
  marca: text('marca'),
  model: text('model').notNull(),
  serialNumber: text('serialNumber').notNull().unique(),
  fechaCompra: timestamp('fechaCompra', { mode: 'date' }),
  status: text('status').notNull().default('available'),
  ubicacionActual: text('ubicacionActual'),
  imagenDrone: text('imagenDrone'),
  peso: decimal('peso', { precision: 10, scale: 2 }),
  velocidadMaxima: decimal('velocidadMaxima', { precision: 10, scale: 2 }),
  altitudMaxima: decimal('altitudMaxima', { precision: 10, scale: 2 }),
  resistenciaViento: text('resistenciaViento'),
  temperaturaOperativa: text('temperaturaOperativa'),
  tiempoMaximoVuelo: decimal('tiempoMaximoVuelo', { precision: 10, scale: 2 }),
  capacidadTanque: decimal('capacidadTanque', { precision: 10, scale: 2 }),
  presion: decimal('presion', { precision: 10, scale: 2 }),
  tipoBoquilla: text('tipoBoquilla'),
  alcance: decimal('alcance', { precision: 10, scale: 2 }),
  tipoProducto: text('tipoProducto'),
  capacidadBaterias: text('capacidadBaterias'),
  lastMaintenanceDate: timestamp('lastMaintenanceDate', { mode: 'date' }),
  proximoMantenimiento: timestamp('proximoMantenimiento', { mode: 'date' }),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
})

export const serviceRequests = pgTable('service_requests', {
  id: serial('id').primaryKey(),
  clientId: integer('clientId')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  serviceTypeId: integer('serviceTypeId').references(() => serviceTypes.id, { onDelete: 'set null' }),
  droneId: integer('droneId').references(() => drones.id, { onDelete: 'set null' }),
  assignedUserId: text('assignedUserId').references(() => user.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('pending'),
  scheduledDate: timestamp('scheduledDate', { mode: 'date' }),
  completedDate: timestamp('completedDate', { mode: 'date' }),
  location: text('location'),
  coordinates: text('coordinates'),
  area: decimal('area', { precision: 10, scale: 2 }),
  notes: text('notes'),
  totalPrice: decimal('totalPrice', { precision: 10, scale: 2 }),
  departamento: text('departamento'),
  altitud: decimal('altitud', { precision: 10, scale: 2 }),
  tipoZona: text('tipoZona'),
  distanciaAeropuerto: decimal('distanciaAeropuerto', { precision: 10, scale: 2 }),
  restriccionAerea: text('restriccionAerea'),
  estadoPermisoAerocivil: text('estadoPermisoAerocivil'),
  tipoSuperficie: text('tipoSuperficie'),
  areaTotalM2: decimal('areaTotalM2', { precision: 12, scale: 2 }),
  alturaMaxima: decimal('alturaMaxima', { precision: 10, scale: 2 }),
  cantidadNiveles: integer('cantidadNiveles'),
  tipoSuciedad: text('tipoSuciedad'),
  nivelContaminacion: text('nivelContaminacion'),
  frecuenciaLimpieza: text('frecuenciaLimpieza'),
  fechaEstimada: timestamp('fechaEstimada', { mode: 'date' }),
  prioridad: text('prioridad'),
  estadoOperativo: text('estadoOperativo'),
  horasEstimadasVuelo: decimal('horasEstimadasVuelo', { precision: 8, scale: 2 }),
  cantidadAguaRequerida: decimal('cantidadAguaRequerida', { precision: 10, scale: 2 }),
  cantidadQuimico: decimal('cantidadQuimico', { precision: 10, scale: 2 }),
  numeroBaterias: integer('numeroBaterias'),
  numeroOperadores: integer('numeroOperadores'),
  riesgoOperacional: text('riesgoOperacional'),
  horaInicio: timestamp('horaInicio', { mode: 'date' }),
  horaFinalizacion: timestamp('horaFinalizacion', { mode: 'date' }),
  tiempoTotalVuelo: decimal('tiempoTotalVuelo', { precision: 10, scale: 2 }),
  consumoAgua: decimal('consumoAgua', { precision: 10, scale: 2 }),
  distanciaRecorrida: decimal('distanciaRecorrida', { precision: 10, scale: 2 }),
  alturaMaximaRegistrada: decimal('alturaMaximaRegistrada', { precision: 10, scale: 2 }),
  velocidadPromedio: decimal('velocidadPromedio', { precision: 10, scale: 2 }),
  consumoBateria: decimal('consumoBateria', { precision: 10, scale: 2 }),
  numeroCiclos: integer('numeroCiclos'),
  imagenPlano: text('imagenPlano'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
})

// Type exports for use in components
export type User = typeof user.$inferSelect
export type Client = typeof clients.$inferSelect
export type ServiceType = typeof serviceTypes.$inferSelect
export type Drone = typeof drones.$inferSelect
export type ServiceRequest = typeof serviceRequests.$inferSelect
