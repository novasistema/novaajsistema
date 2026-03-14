'use client';

import { useEffect, useState } from 'react';

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  documento?: string;
  tipo_documento: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    documento: '',
    tipo_documento: 'DNI',
  });

  const loadClientes = async () => {
    const res = await fetch('/api/clientes');
    const data = await res.json();
    setClientes(data);
  };

  useEffect(() => {
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingCliente ? `/api/clientes?id=${editingCliente.id}` : '/api/clientes';
    const method = editingCliente ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (res.ok) {
      setShowModal(false);
      setEditingCliente(null);
      setFormData({ nombre: '', email: '', telefono: '', direccion: '', documento: '', tipo_documento: 'DNI' });
      loadClientes();
    } else {
      const error = await res.json();
      alert(error.error || 'Error al guardar');
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      documento: cliente.documento || '',
      tipo_documento: cliente.tipo_documento,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;
    
    const res = await fetch(`/api/clientes?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadClientes();
    }
  };

  const openNewModal = () => {
    setEditingCliente(null);
    setFormData({ nombre: '', email: '', telefono: '', direccion: '', documento: '', tipo_documento: 'DNI' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-600">Gestiona tus clientes</p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nuevo Cliente
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td className="px-6 py-4 whitespace-nowrap">{cliente.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cliente.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cliente.telefono || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {cliente.tipo_documento}-{cliente.documento || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(cliente)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
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
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo Doc.</label>
                    <select
                      value={formData.tipo_documento}
                      onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CUIT">CUIT</option>
                      <option value="CUIL">CUIL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número</label>
                    <input
                      type="text"
                      value={formData.documento}
                      onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
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
