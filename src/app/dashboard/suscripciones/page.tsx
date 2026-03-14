'use client';

import { useEffect, useState } from 'react';

interface Cliente {
  id: string;
  nombre: string;
}

interface Aplicacion {
  id: string;
  nombre: string;
  precio_mensual: number;
  activa: boolean;
}

interface Suscripcion {
  id: string;
  cliente_id: string;
  aplicacion_id: string;
  activa: boolean;
  fecha_inicio: string;
  fecha_fin?: string;
  cliente_nombre?: string;
  aplicacion_nombre?: string;
  precio_mensual?: number;
}

export default function SuscripcionesPage() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    aplicacion_id: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    activa: true,
  });

  const loadData = async () => {
    const [suscRes, clientesRes, appsRes] = await Promise.all([
      fetch('/api/suscripciones'),
      fetch('/api/clientes'),
      fetch('/api/aplicaciones'),
    ]);
    setSuscripciones(await suscRes.json());
    setClientes(await clientesRes.json());
    setAplicaciones((await appsRes.json()).filter((a: Aplicacion) => a.activa));
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/suscripciones'),
      fetch('/api/clientes'),
      fetch('/api/aplicaciones'),
    ])
      .then(([suscRes, clientesRes, appsRes]) => Promise.all([suscRes.json(), clientesRes.json(), appsRes.json()]))
      .then(([suscData, clientesData, appsData]) => {
        setSuscripciones(suscData);
        setClientes(clientesData);
        setAplicaciones(appsData.filter((a: Aplicacion) => a.activa));
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/suscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (res.ok) {
      setShowModal(false);
      setFormData({
        cliente_id: '',
        aplicacion_id: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        activa: true,
      });
      loadData();
    }
  };

  const toggleActiva = async (susc: Suscripcion) => {
    await fetch(`/api/suscripciones?id=${susc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activa: !susc.activa }),
    });
    loadData();
  };

  const deleteSuscripcion = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta suscripción?')) return;
    
    const res = await fetch(`/api/suscripciones?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadData();
    }
  };

  const selectedApp = aplicaciones.find(a => a.id === formData.aplicacion_id);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suscripciones</h1>
          <p className="mt-1 text-sm text-gray-600">Gestiona las suscripciones de tus clientes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nueva Suscripción
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aplicación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suscripciones.map((susc) => (
              <tr key={susc.id}>
                <td className="px-6 py-4 whitespace-nowrap">{susc.cliente_nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{susc.aplicacion_nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">${susc.precio_mensual?.toLocaleString('es-AR')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{susc.fecha_inicio}</td>
                <td className="px-6 py-4 whitespace-nowrap">{susc.fecha_fin || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      susc.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {susc.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => toggleActiva(susc)}
                    className="text-yellow-600 hover:text-yellow-900 mr-4"
                  >
                    {susc.activa ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => deleteSuscripcion(susc.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {suscripciones.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No hay suscripciones registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva Suscripción</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente *</label>
                  <select
                    required
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aplicación *</label>
                  <select
                    required
                    value={formData.aplicacion_id}
                    onChange={(e) => setFormData({ ...formData, aplicacion_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar aplicación</option>
                    {aplicaciones.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre} - ${a.precio_mensual}/mes</option>
                    ))}
                  </select>
                </div>
                {selectedApp && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">
                      Precio: <strong>${selectedApp.precio_mensual.toLocaleString('es-AR')}/mes</strong>
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activa"
                    checked={formData.activa}
                    onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="activa" className="ml-2 block text-sm text-gray-700">
                    Suscripción activa
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
