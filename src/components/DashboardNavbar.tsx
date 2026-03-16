'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Empresa {
  nombre: string;
  logo: string;
}

export default function DashboardNavbar() {
  const router = useRouter();
  const [empresa, setEmpresa] = useState<Empresa>({ nombre: 'AppManager', logo: '' });

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

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2">
                {empresa.logo ? (
                  <img src={empresa.logo} alt="Logo" className="h-8 w-auto" />
                ) : (
                  <span className="text-xl font-bold text-blue-600">AppManager</span>
                )}
                {empresa.logo && (
                  <span className="text-xl font-bold text-blue-600">{empresa.nombre}</span>
                )}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Inicio
              </Link>
              <Link
                href="/dashboard/clientes"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Clientes
              </Link>
              <Link
                href="/dashboard/aplicaciones"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Aplicaciones
              </Link>
              <Link
                href="/dashboard/suscripciones"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Suscripciones
              </Link>
              <Link
                href="/dashboard/pagos"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Pagos
              </Link>
              <Link
                href="/dashboard/comprobantes"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Comprobantes
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              href="/dashboard/configuracion"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Configuración
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('adminAuthenticated');
                router.push('/login');
              }}
              className="ml-3 text-red-500 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
