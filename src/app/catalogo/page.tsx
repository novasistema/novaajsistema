'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Aplicacion {
  id: string;
  nombre: string;
  descripcion: string;
  precio_mensual: number;
  activa: boolean;
}

interface Empresa {
  nombre: string;
  logo: string;
}

export default function CatalogoPage() {
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
  const [empresa, setEmpresa] = useState<Empresa>({ nombre: '', logo: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/aplicaciones').then(res => res.json()),
      fetch('/api/pagos?type=empresa').then(res => res.json()),
    ])
      .then(([appsData, empresaData]) => {
        setAplicaciones(appsData.filter((a: Aplicacion) => a.activa));
        if (empresaData.nombre) {
          setEmpresa({ nombre: empresaData.nombre, logo: empresaData.logo || '' });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="relative overflow-hidden">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {empresa.logo ? (
                <img src={empresa.logo} alt="Logo" className="h-10 w-auto" />
              ) : null}
              <span className="text-2xl font-bold text-white">
                {empresa.nombre || 'AllManager'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-slate-300 hover:text-white px-4 py-2"
              >
                Admin
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Nuestras <span className="text-blue-400">Aplicaciones</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Elige las aplicaciones que mejor se adapten a tus necesidades y comienza a usarlas hoy mismo
            </p>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
      </header>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {aplicaciones.length === 0 ? (
            <div className="text-center text-slate-400 py-20">
              <p className="text-xl">No hay aplicaciones disponibles en este momento.</p>
              <p className="mt-2">Vuelve a visitarnos más tarde.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aplicaciones.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all hover:transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">📱</span>
                    </div>
                    <span className="bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-full">
                      Disponible
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{app.nombre}</h3>
                  <p className="text-slate-400 mb-6">
                    {app.descripcion || 'Una solución completa para tus necesidades'}
                  </p>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-white">${app.precio_mensual.toLocaleString('es-AR')}</span>
                    <span className="text-slate-400">/mes</span>
                  </div>
                  
                  <Link
                    href={`/comprar/${app.id}`}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl font-semibold transition-colors"
                  >
                    Suscribirse
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">¿Necesitas ayuda?</h2>
          <p className="text-slate-400 mb-6">
            Contáctanos para resolver cualquier duda sobre nuestros productos
          </p>
          <Link
            href="/"
            className="inline-block bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </section>

      <footer className="bg-slate-950 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              {empresa.logo ? (
                <img src={empresa.logo} alt="Logo" className="h-6 w-auto" />
              ) : null}
              <span className="text-white font-semibold">
                {empresa.nombre || 'AllManager'}
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Todos los derechos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
