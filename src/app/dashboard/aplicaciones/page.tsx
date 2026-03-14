'use client';

import { useEffect, useState } from 'react';

interface Aplicacion {
  id: string;
  nombre: string;
  descripcion?: string;
  precio_mensual: number;
  activa: boolean;
}

export default function AplicacionesPage() {
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Aplicacion | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_mensual: '',
    activa: true,
  });

  const loadAplicaciones = async () => {
    const res = await fetch('/api/aplicaciones');
    const data = await res.json();
    setAplicaciones(data);
  };

  useEffect(() => {
    fetch('/api/aplicaciones')
      .then(res => res.json())
      .then(data => setAplicaciones(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingApp ? `/api/aplicaciones?id=${editingApp.id}` : '/api/aplicaciones';
    const method = editingApp ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (res.ok) {
      setShowModal(false);
      setEditingApp(null);
      setFormData({ nombre: '', descripcion: '', precio_mensual: '', activa: true });
      loadAplicaciones();
    } else {
      const error = await res.json();
      alert(error.error || 'Error al guardar');
    }
  };

  const handleEdit = (app: Aplicacion) => {
    setEditingApp(app);
    setFormData({
      nombre: app.nombre,
      descripcion: app.descripcion || '',
      precio_mensual: app.precio_mensual.toString(),
      activa: app.activa,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta aplicación?')) return;
    
    const res = await fetch(`/api/aplicaciones?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadAplicaciones();
    }
  };

  const toggleActiva = async (app: Aplicacion) => {
    await fetch(`/api/aplicaciones?id=${app.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activa: !app.activa }),
    });
    loadAplicaciones();
  };

  const openNewModal = () => {
    setEditingApp(null);
    setFormData({ nombre: '', descripcion: '', precio_mensual: '', activa: true });
    setShowModal(true);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aplicaciones</h1>
          <p className="mt-1 text-sm text-gray-600">Gestiona tus aplicaciones</p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nueva Aplicación
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aplicaciones.map((app) => (
          <div key={app.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">{app.nombre}</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    app.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {app.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{app.descripcion || 'Sin descripción'}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">${app.precio_mensual.toLocaleString('es-AR')}/mes</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActiva(app)}
                    className={`text-sm px-2 py-1 rounded ${
                      app.activa ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {app.activa ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleEdit(app)}
                    className="text-sm text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="text-sm text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {aplicaciones.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No hay aplicaciones registradas
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingApp ? 'Editar Aplicación' : 'Nueva Aplicación'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio Mensual *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.precio_mensual}
                    onChange={(e) => setFormData({ ...formData, precio_mensual: e.target.value })}
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
                    Aplicación activa
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
