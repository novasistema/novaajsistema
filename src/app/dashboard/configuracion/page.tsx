'use client';

import { useEffect, useState } from 'react';

interface Empresa {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  cuil: string;
  documento: string;
}

export default function ConfiguracionPage() {
  const [empresa, setEmpresa] = useState<Empresa>({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    cuil: '',
    documento: 'DNI',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/pagos?type=empresa')
      .then(res => res.json())
      .then(data => {
        if (data.nombre) {
          setEmpresa(data);
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/pagos?action=empresa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empresa),
    });
    
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-600">Configura los datos de tu empresa</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        {saved && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Configuración guardada correctamente
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa *</label>
              <input
                type="text"
                required
                value={empresa.nombre}
                onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Mi Empresa"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                <select
                  value={empresa.documento}
                  onChange={(e) => setEmpresa({ ...empresa, documento: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="DNI">DNI</option>
                  <option value="CUIT">CUIT</option>
                  <option value="CUIL">CUIL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Documento</label>
                <input
                  type="text"
                  value={empresa.cuil}
                  onChange={(e) => setEmpresa({ ...empresa, cuil: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="XX-XXXXXXXX-X"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                value={empresa.direccion}
                onChange={(e) => setEmpresa({ ...empresa, direccion: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Calle y número"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  value={empresa.telefono}
                  onChange={(e) => setEmpresa({ ...empresa, telefono: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="+54 9 11 XXXX XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={empresa.email}
                  onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="contacto@empresa.com"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
        
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-medium text-yellow-800">Nota importante</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Los comprobantes generados por este sistema <strong>no constituyen documento fiscal</strong> 
            y no están registrados frente a la ARCA (AFIP). Este sistema es solo para control interno 
            y emitirá comprobantes simples de venta y recibos de pago.
          </p>
        </div>
      </div>
    </div>
  );
}
