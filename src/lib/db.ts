import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('app.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    direccion TEXT,
    documento TEXT,
    tipo_documento TEXT DEFAULT 'DNI',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS aplicaciones (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio_mensual REAL NOT NULL,
    activa INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS suscripciones (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    aplicacion_id TEXT NOT NULL,
    activa INTEGER DEFAULT 1,
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (aplicacion_id) REFERENCES aplicaciones(id)
  );

  CREATE TABLE IF NOT EXISTS pagos (
    id TEXT PRIMARY KEY,
    suscripcion_id TEXT NOT NULL,
    monto REAL NOT NULL,
    fecha_pago TEXT NOT NULL,
    metodo_pago TEXT DEFAULT 'efectivo',
    comprobante_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suscripcion_id) REFERENCES suscripciones(id),
    FOREIGN KEY (comprobante_id) REFERENCES comprobantes(id)
  );

  CREATE TABLE IF NOT EXISTS comprobantes (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    cliente_id TEXT NOT NULL,
    suscripcion_id TEXT,
    numero TEXT NOT NULL,
    fecha TEXT NOT NULL,
    subtotal REAL NOT NULL,
    iva REAL DEFAULT 0,
    total REAL NOT NULL,
    pdf_data TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (suscripcion_id) REFERENCES suscripciones(id)
  );

  CREATE TABLE IF NOT EXISTS empresa (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    nombre TEXT NOT NULL,
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    cuil TEXT,
    documento TEXT DEFAULT 'DNI',
    logo TEXT
  );
`);

db.exec(`ALTER TABLE empresa ADD COLUMN logo TEXT;`);

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  documento?: string;
  tipo_documento: string;
  created_at: string;
  updated_at: string;
}

export interface Aplicacion {
  id: string;
  nombre: string;
  descripcion?: string;
  precio_mensual: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Suscripcion {
  id: string;
  cliente_id: string;
  aplicacion_id: string;
  activa: boolean;
  fecha_inicio: string;
  fecha_fin?: string;
  created_at: string;
  updated_at: string;
  cliente_nombre?: string;
  aplicacion_nombre?: string;
  precio_mensual?: number;
}

export interface Pago {
  id: string;
  suscripcion_id: string;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  comprobante_id?: string;
  created_at: string;
}

export interface Comprobante {
  id: string;
  tipo: 'venta' | 'recibo';
  cliente_id: string;
  suscripcion_id?: string;
  numero: string;
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  pdf_data?: string;
  created_at: string;
  cliente_nombre?: string;
}

export function getClientes(): Cliente[] {
  return db.prepare('SELECT * FROM clientes ORDER BY created_at DESC').all() as Cliente[];
}

export function getClienteById(id: string): Cliente | undefined {
  return db.prepare('SELECT * FROM clientes WHERE id = ?').get(id) as Cliente | undefined;
}

export function createCliente(data: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Cliente {
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO clientes (id, nombre, email, telefono, direccion, documento, tipo_documento, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.nombre, data.email, data.telefono || null, data.direccion || null, data.documento || null, data.tipo_documento || 'DNI', now, now);
  return getClienteById(id)!;
}

export function updateCliente(id: string, data: Partial<Omit<Cliente, 'id' | 'created_at' | 'updated_at'>>): Cliente | undefined {
  const cliente = getClienteById(id);
  if (!cliente) return undefined;
  
  const now = new Date().toISOString();
  const updates = Object.entries(data).filter(([_, v]) => v !== undefined);
  if (updates.length === 0) return cliente;
  
  const setClause = updates.map(([k]) => `${k} = ?`).join(', ');
  const values = updates.map(([_, v]) => v);
  
  db.prepare(`UPDATE clientes SET ${setClause}, updated_at = ? WHERE id = ?`).run(...values, now, id);
  return getClienteById(id);
}

export function deleteCliente(id: string): boolean {
  const result = db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getAplicaciones(): Aplicacion[] {
  return db.prepare('SELECT * FROM aplicaciones ORDER BY created_at DESC').all() as Aplicacion[];
}

export function getAplicacionById(id: string): Aplicacion | undefined {
  return db.prepare('SELECT * FROM aplicaciones WHERE id = ?').get(id) as Aplicacion | undefined;
}

export function createAplicacion(data: Omit<Aplicacion, 'id' | 'created_at' | 'updated_at'>): Aplicacion {
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO aplicaciones (id, nombre, descripcion, precio_mensual, activa, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.nombre, data.descripcion || null, data.precio_mensual, data.activa ? 1 : 0, now, now);
  return getAplicacionById(id)!;
}

export function updateAplicacion(id: string, data: Partial<Omit<Aplicacion, 'id' | 'created_at' | 'updated_at'>>): Aplicacion | undefined {
  const app = getAplicacionById(id);
  if (!app) return undefined;
  
  const now = new Date().toISOString();
  const updates = Object.entries(data).filter(([_, v]) => v !== undefined);
  if (updates.length === 0) return app;
  
  const setClause = updates.map(([k]) => `${k} = ?`).join(', ');
  const values = updates.map(([_, v]) => typeof v === 'boolean' ? (v ? 1 : 0) : v);
  
  db.prepare(`UPDATE aplicaciones SET ${setClause}, updated_at = ? WHERE id = ?`).run(...values, now, id);
  return getAplicacionById(id);
}

export function deleteAplicacion(id: string): boolean {
  const result = db.prepare('DELETE FROM aplicaciones WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getSuscripciones(): Suscripcion[] {
  return db.prepare(`
    SELECT s.*, c.nombre as cliente_nombre, a.nombre as aplicacion_nombre, a.precio_mensual
    FROM suscripciones s
    JOIN clientes c ON s.cliente_id = c.id
    JOIN aplicaciones a ON s.aplicacion_id = a.id
    ORDER BY s.created_at DESC
  `).all() as Suscripcion[];
}

export function getSuscripcionById(id: string): Suscripcion | undefined {
  return db.prepare(`
    SELECT s.*, c.nombre as cliente_nombre, a.nombre as aplicacion_nombre, a.precio_mensual
    FROM suscripciones s
    JOIN clientes c ON s.cliente_id = c.id
    JOIN aplicaciones a ON s.aplicacion_id = a.id
    WHERE s.id = ?
  `).get(id) as Suscripcion | undefined;
}

export function getSuscripcionesByCliente(clienteId: string): Suscripcion[] {
  return db.prepare(`
    SELECT s.*, c.nombre as cliente_nombre, a.nombre as aplicacion_nombre, a.precio_mensual
    FROM suscripciones s
    JOIN clientes c ON s.cliente_id = c.id
    JOIN aplicaciones a ON s.aplicacion_id = a.id
    WHERE s.cliente_id = ?
    ORDER BY s.created_at DESC
  `).all(clienteId) as Suscripcion[];
}

export function createSuscripcion(data: Omit<Suscripcion, 'id' | 'created_at' | 'updated_at' | 'cliente_nombre' | 'aplicacion_nombre' | 'precio_mensual'>): Suscripcion {
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO suscripciones (id, cliente_id, aplicacion_id, activa, fecha_inicio, fecha_fin, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.cliente_id, data.aplicacion_id, data.activa ? 1 : 0, data.fecha_inicio, data.fecha_fin || null, now, now);
  return getSuscripcionById(id)!;
}

export function updateSuscripcion(id: string, data: Partial<Omit<Suscripcion, 'id' | 'created_at' | 'updated_at' | 'cliente_nombre' | 'aplicacion_nombre' | 'precio_mensual'>>): Suscripcion | undefined {
  const susc = getSuscripcionById(id);
  if (!susc) return undefined;
  
  const now = new Date().toISOString();
  const updates = Object.entries(data).filter(([_, v]) => v !== undefined);
  if (updates.length === 0) return susc;
  
  const setClause = updates.map(([k]) => `${k} = ?`).join(', ');
  const values = updates.map(([_, v]) => typeof v === 'boolean' ? (v ? 1 : 0) : v);
  
  db.prepare(`UPDATE suscripciones SET ${setClause}, updated_at = ? WHERE id = ?`).run(...values, now, id);
  return getSuscripcionById(id);
}

export function deleteSuscripcion(id: string): boolean {
  const result = db.prepare('DELETE FROM suscripciones WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getPagos(): (Pago & { suscripcion_cliente?: string; suscripcion_aplicacion?: string })[] {
  return db.prepare(`
    SELECT p.*, c.nombre as suscripcion_cliente, a.nombre as suscripcion_aplicacion
    FROM pagos p
    JOIN suscripciones s ON p.suscripcion_id = s.id
    JOIN clientes c ON s.cliente_id = c.id
    JOIN aplicaciones a ON s.aplicacion_id = a.id
    ORDER BY p.fecha_pago DESC
  `).all() as (Pago & { suscripcion_cliente?: string; suscripcion_aplicacion?: string })[];
}

export function getPagoById(id: string): (Pago & { suscripcion_cliente?: string; suscripcion_aplicacion?: string }) | undefined {
  return db.prepare(`
    SELECT p.*, c.nombre as suscripcion_cliente, a.nombre as suscripcion_aplicacion
    FROM pagos p
    JOIN suscripciones s ON p.suscripcion_id = s.id
    JOIN clientes c ON s.cliente_id = c.id
    JOIN aplicaciones a ON s.aplicacion_id = a.id
    WHERE p.id = ?
  `).get(id) as (Pago & { suscripcion_cliente?: string; suscripcion_aplicacion?: string }) | undefined;
}

export function createPago(data: Omit<Pago, 'id' | 'created_at'>): Pago {
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO pagos (id, suscripcion_id, monto, fecha_pago, metodo_pago, comprobante_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.suscripcion_id, data.monto, data.fecha_pago, data.metodo_pago || 'efectivo', data.comprobante_id || null, now);
  return getPagoById(id)! as Pago;
}

export function getComprobantes(): Comprobante[] {
  return db.prepare(`
    SELECT c.*, cl.nombre as cliente_nombre
    FROM comprobantes c
    JOIN clientes cl ON c.cliente_id = cl.id
    ORDER BY c.fecha DESC
  `).all() as Comprobante[];
}

export function getComprobanteById(id: string): Comprobante | undefined {
  return db.prepare(`
    SELECT c.*, cl.nombre as cliente_nombre
    FROM comprobantes c
    JOIN clientes cl ON c.cliente_id = cl.id
    WHERE c.id = ?
  `).get(id) as Comprobante | undefined;
}

export function getNextComprobanteNumber(tipo: 'venta' | 'recibo'): string {
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM comprobantes WHERE tipo = ?
  `).get(tipo) as { count: number };
  const nextNum = result.count + 1;
  const prefix = tipo === 'venta' ? '0001' : '0002';
  return `${prefix}-${String(nextNum).padStart(8, '0')}`;
}

export function createComprobante(data: Omit<Comprobante, 'id' | 'created_at' | 'cliente_nombre'>): Comprobante {
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO comprobantes (id, tipo, cliente_id, suscripcion_id, numero, fecha, subtotal, iva, total, pdf_data, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.tipo, data.cliente_id, data.suscripcion_id || null, data.numero, data.fecha, data.subtotal, data.iva || 0, data.total, data.pdf_data || null, now);
  return getComprobanteById(id)!;
}

export function getEmpresa(): { nombre: string; direccion: string; telefono: string; email: string; cuil: string; documento: string; logo: string } | undefined {
  return db.prepare('SELECT * FROM empresa WHERE id = 1').get() as { nombre: string; direccion: string; telefono: string; email: string; cuil: string; documento: string; logo: string } | undefined;
}

export function setEmpresa(data: { nombre: string; direccion: string; telefono: string; email: string; cuil: string; documento: string; logo: string }): void {
  db.prepare(`
    INSERT OR REPLACE INTO empresa (id, nombre, direccion, telefono, email, cuil, documento, logo)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.nombre, data.direccion, data.telefono, data.email, data.cuil, data.documento, data.logo || null);
}

export function getEstadisticas() {
  const totalClientes = (db.prepare('SELECT COUNT(*) as count FROM clientes').get() as { count: number }).count;
  const totalAplicaciones = (db.prepare('SELECT COUNT(*) as count FROM aplicaciones').get() as { count: number }).count;
  const suscripcionesActivas = (db.prepare('SELECT COUNT(*) as count FROM suscripciones WHERE activa = 1').get() as { count: number }).count;
  const ingresosMes = (db.prepare(`
    SELECT COALESCE(SUM(monto), 0) as total FROM pagos 
    WHERE strftime('%Y-%m', fecha_pago) = strftime('%Y-%m', 'now')
  `).get() as { total: number }).total;
  
  return { totalClientes, totalAplicaciones, suscripcionesActivas, ingresosMes };
}

export default db;
