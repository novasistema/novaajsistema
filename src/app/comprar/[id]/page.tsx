'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Aplicacion {
  id: string;
  nombre: string;
  descripcion: string;
  precio_mensual: number;
}

interface Empresa {
  nombre: string;
  logo: string;
  mercadopago_access_token?: string;
}

export default function ComprarPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;
  
  const [app, setApp] = useState<Aplicacion | null>(null);
  const [empresa, setEmpresa] = useState<Empresa>({ nombre: '', logo: '' });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [cliente, setCliente] = useState({
    nombre: '',
    email: '',
    telefono: '',
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/aplicaciones?id=${appId}`).then(res => res.json()),
      fetch('/api/pagos?type=empresa').then(res => res.json()),
    ])
      .then(([appData, empresaData]) => {
        if (appData.id) {
          setApp(appData);
        }
        if (empresaData.nombre) {
          setEmpresa(empresaData);
        }
      })
      .finally(() => setLoading(false));
  }, [appId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cliente.nombre || !cliente.email) {
      setError('Por favor completá todos los campos requeridos');
      return;
    }
    
    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/mercado-pago/crear-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aplicacionId: appId,
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono,
          precio: app?.precio_mensual,
        }),
      });

      const data = await res.json();

      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        setError(data.error || 'Error al procesar el pago. Verificá que Mercado Pago esté configurado.');
        setProcessing(false);
      }
    } catch (err) {
      setError('Error de conexión. Intentá nuevamente.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Aplicación no encontrada</h1>
          <Link href="/catalogo" className="text-blue-400 hover:text-blue-300">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/catalogo" className="text-slate-400 hover:text-white mb-8 inline-block">
          ← Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Resumen de compra</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">📱</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{app.nombre}</h3>
                <p className="text-slate-400 text-sm">{app.descripcion || 'Suscripción mensual'}</p>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <div className="flex justify-between text-slate-400 mb-2">
                <span>Plan mensual</span>
                <span>${app.precio_mensual.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-slate-400 mb-2">
                <span>Impuestos</span>
                <span>Incluidos</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-slate-700 mt-2">
                <span>Total</span>
                <span>${app.precio_mensual.toLocaleString('es-AR')}/mes</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Datos del cliente</h2>
            
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={cliente.nombre}
                  onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={cliente.email}
                  onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  value={cliente.telefono}
                  onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+54 9 11 XXXX XXXX"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>Procesando...</>
                  ) : (
                    <>
                      <span>💳</span>
                      <span>Pagar con Mercado Pago</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Pago seguro mediante Mercado Pago. Tu suscripción se activará automáticamente tras el pago.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
