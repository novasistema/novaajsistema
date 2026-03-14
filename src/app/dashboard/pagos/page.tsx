'use client';

import { useEffect, useState } from 'react';

interface Suscripcion {
  id: string;
  cliente_nombre: string;
  aplicacion_nombre: string;
  precio_mensual: number;
  activa: boolean;
}

interface Pago {
  id: string;
  suscripcion_id: string;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  suscripcion_cliente?: string;
  suscripcion_aplicacion?: string;
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    suscripcion_id: '',
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    metodo_pago: 'efectivo',
    activar_suscripcion: true,
  });

  const loadData = async () => {
    const [pagosRes, suscRes] = await Promise.all([
      fetch('/api/pagos'),
      fetch('/api/suscripciones'),
    ]);
    setPagos(await pagosRes.json());
    setSuscripciones(await suscRes.json());
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/pagos'),
      fetch('/api/suscripciones'),
    ])
      .then(([pagosRes, suscRes]) => Promise.all([pagosRes.json(), suscRes.json()]))
      .then(([pagosData, suscData]) => {
        setPagos(pagosData);
        setSuscripciones(suscData);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/pagos?action=pago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (res.ok) {
      const result = await res.json();
      setShowModal(false);
      setFormData({
        suscripcion_id: '',
        monto: '',
        fecha_pago: new Date().toISOString().split('T')[0],
        metodo_pago: 'efectivo',
        activar_suscripcion: true,
      });
      loadData();
      if (result.comprobante) {
        alert(`Pago registrado. Comprobante generado: ${result.comprobante.numero}`);
      }
    }
  };

  const selectedSusc = suscripciones.find(s => s.id === formData.suscripcion_id);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
          <p className="mt-1 text-sm text-gray-600">Registra los pagos de tus clientes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Registrar Pago
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aplicación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagos.map((pago) => (
              <tr key={pago.id}>
                <td className="px-6 py-4 whitespace-nowrap">{pago.fecha_pago}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pago.suscripcion_cliente}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pago.suscripcion_aplicacion}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">${pago.monto.toLocaleString('es-AR')}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{pago.metodo_pago}</td>
              </tr>
            ))}
            {pagos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay pagos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Registrar Pago</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Suscripción *</label>
                  <select
                    required
                    value={formData.suscripcion_id}
                    onChange={(e) => {
                      const susc = suscripciones.find(s => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        suscripcion_id: e.target.value,
                        monto: susc ? susc.precio_mensual.toString() : '',
                      });
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar suscripción</option>
                    {suscripciones.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.cliente_nombre} - {s.aplicacion_nombre} (${s.precio_mensual}/mes)
                      </option>
                    ))}
                  </select>
                </div>
                {selectedSusc && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">Cliente: {selectedSusc.cliente_nombre}</p>
                    <p className="text-sm text-gray-600">Aplicación: {selectedSusc.aplicacion_nombre}</p>
                    <p className="text-sm text-gray-600">Estado: {selectedSusc.activa ? 'Activa' : 'Inactiva'}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monto *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Pago *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_pago}
                    onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                  <select
                    value={formData.metodo_pago}
                    onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="mercado_pago">Mercado Pago</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activar_suscripcion"
                    checked={formData.activar_suscripcion}
                    onChange={(e) => setFormData({ ...formData, activar_suscripcion: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="activar_suscripcion" className="ml-2 block text-sm text-gray-700">
                    Activar/renovar suscripción al pagar
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
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
