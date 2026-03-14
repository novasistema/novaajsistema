'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Empresa {
  nombre: string;
  logo: string;
}

export default function HomePage() {
  const [empresa, setEmpresa] = useState<Empresa>({ nombre: '', logo: '' });

  useEffect(() => {
    fetch('/api/pagos?type=empresa')
      .then(res => res.json())
      .then(data => {
        if (data.nombre) {
          setEmpresa({ nombre: data.nombre, logo: data.logo || '' });
        }
      })
      .catch(console.error);
  }, []);

  const soluciones = [
    {
      titulo: 'Gestión Financiera',
      descripcion: 'Controla tus ingresos, gastos y presupuestos de forma sencilla',
      icono: '💰',
      color: 'bg-green-50'
    },
    {
      titulo: 'Organización Personal',
      descripcion: 'Agenda, tareas y recordatorios para tu día a día',
      icono: '📋',
      color: 'bg-blue-50'
    },
    {
      titulo: 'Soluciones Empresariales',
      descripcion: 'Gestión de clientes, stock y facturación para tu negocio',
      icono: '🏢',
      color: 'bg-purple-50'
    },
    {
      titulo: 'Para Emprendedores',
      descripcion: 'Herramientas para hacer crecer tu startup o proyecto',
      icono: '🚀',
      color: 'bg-orange-50'
    },
    {
      titulo: 'Salud y Bienestar',
      descripcion: 'Seguimiento de hábitos saludables y objetivos personales',
      icono: '❤️',
      color: 'bg-red-50'
    },
    {
      titulo: 'Productividad',
      descripcion: 'Optimiza tu tiempo y alcanza tus metas más rápido',
      icono: '⚡',
      color: 'bg-yellow-50'
    }
  ];

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
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              No vendemos aplicaciones,<br />
              <span className="text-blue-400">solucionamos problemas</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto">
              Entendemos que cada persona, emprendedor y empresa enfrenta desafíos únicos. 
              Por eso creamos soluciones tecnológicas que se adaptan a tus necesidades específicas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#soluciones"
                className="bg-white text-slate-900 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                Ver Soluciones
              </a>
              <Link
                href="/dashboard"
                className="border-2 border-slate-600 text-white px-8 py-3 rounded-lg font-semibold hover:border-white transition-colors"
              >
                Acceso Admin
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
      </header>

      <section id="soluciones" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Nuestras Soluciones
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tecnologías diseñadas para resolver problemas reales en diferentes áreas de tu vida
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {soluciones.map((solucion, index) => (
              <div
                key={index}
                className={`${solucion.color} rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300`}
              >
                <div className="text-4xl mb-4">{solucion.icono}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{solucion.titulo}</h3>
                <p className="text-slate-600">{solucion.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                ¿Por qué elegirnos?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Soluciones Personalizadas</h3>
                    <p className="text-slate-400">Nos adaptamos a tus necesidades específicas</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">⚙</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Tecnología Moderna</h3>
                    <p className="text-slate-400">Herramientas actualizadas y fáciles de usar</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">💬</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Soporte Cercano</h3>
                    <p className="text-slate-400">Te acompañamos en cada paso del proceso</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 border border-slate-600">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                ¿Listo para transformar tu negocio?
              </h3>
              <p className="text-slate-300 text-center mb-8">
                Contáctanos y descubrí cómo podemos ayudarte a resolver tus desafíos
              </p>
              <div className="text-center">
                <Link
                  href="/dashboard"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Acceder al Sistema
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              {empresa.logo ? (
                <img src={empresa.logo} alt="Logo" className="h-8 w-auto" />
              ) : null}
              <span className="text-white font-semibold">
                {empresa.nombre || 'AllManager'}
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Todos los derechos reservados
            </p>
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white text-sm"
            >
              Acceso Administrador
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
