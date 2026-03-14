'use client';

import { useEffect, useState } from 'react';

interface Cliente {
  id: string;
  nombre: string;
}

interface Comprobante {
  id: string;
  tipo: 'venta' | 'recibo';
  cliente_id: string;
  numero: string;
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  cliente_nombre?: string;
}

export default function ComprobantesPage() {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    con_iva: false,
  });

  const loadData = async () => {
    const [compRes, clientesRes] = await Promise.all([
      fetch('/api/pagos?type=comprobantes'),
      fetch('/api/clientes'),
    ]);
    setComprobantes(await compRes.json());
    setClientes(await clientesRes.json());
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/pagos?type=comprobantes'),
      fetch('/api/clientes'),
    ])
      .then(([compRes, clientesRes]) => Promise.all([compRes.json(), clientesRes.json()]))
      .then(([compData, clientesData]) => {
        setComprobantes(compData);
        setClientes(clientesData);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/pagos?action=comprobante_venta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (res.ok) {
      const comprobante = await res.json();
      setShowModal(false);
      setFormData({
        cliente_id: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        con_iva: false,
      });
      loadData();
      alert(`Comprobante de venta generado: ${comprobante.numero}`);
    }
  };

  const printComprobante = (comp: Comprobante) => {
    const subtotal = comp.subtotal;
    const iva = comp.iva;
    const total = comp.total;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>Comprobante ${comp.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; }
            .comprobante-type { font-size: 18px; margin-top: 10px; }
            .number { font-size: 14px; color: #666; }
            .info { margin: 20px 0; }
            .info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">AppManager</div>
            <div class="comprobante-type">${comp.tipo === 'venta' ? 'COMPROBANTE DE VENTA' : 'RECIBO'}</div>
            <div class="number">N° ${comp.numero}</div>
          </div>
          <div class="info">
            <p><strong>Fecha:</strong> ${comp.fecha}</p>
            <p><strong>Cliente:</strong> ${comp.cliente_nombre}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th style="text-align: right">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${comp.tipo === 'venta' ? 'Servicio de aplicación' : 'Pago de suscripción'}</td>
                <td style="text-align: right">$${subtotal.toLocaleString('es-AR')}</td>
              </tr>
              ${iva > 0 ? `<tr>
                <td>IVA (21%)</td>
                <td style="text-align: right">$${iva.toLocaleString('es-AR')}</td>
              </tr>` : ''}
            </tbody>
          </table>
          <div class="total">TOTAL: $${total.toLocaleString('es-AR')}</div>
          <div class="footer">
            <p>Este comprobante no constituye documento fiscal</p>
            <p>Generado por AppManager</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comprobantes</h1>
          <p className="mt-1 text-sm text-gray-600">Comprobantes de venta y recibos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nuevo Comprobante
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900">Comprobantes de Venta</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {comprobantes.filter(c => c.tipo === 'venta').length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900">Recibos</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {comprobantes.filter(c => c.tipo === 'recibo').length}
          </p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comprobantes.map((comp) => (
              <tr key={comp.id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{comp.numero}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      comp.tipo === 'venta' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {comp.tipo === 'venta' ? 'Venta' : 'Recibo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{comp.cliente_nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{comp.fecha}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">${comp.total.toLocaleString('es-AR')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => printComprobante(comp)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Imprimir
                  </button>
                </td>
              </tr>
            ))}
            {comprobantes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No hay comprobantes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Comprobante de Venta</h2>
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
                  <label className="block text-sm font-medium text-gray-700">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="con_iva"
                    checked={formData.con_iva}
                    onChange={(e) => setFormData({ ...formData, con_iva: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="con_iva" className="ml-2 block text-sm text-gray-700">
                    Incluir IVA (21%)
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
                  Generar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
