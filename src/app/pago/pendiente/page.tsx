import Link from 'next/link';

export default function PagoPendientePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-4xl">⏳</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Pago Pendiente
        </h1>
        
        <p className="text-slate-300 mb-8">
          Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.
        </p>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
          <p className="text-slate-400 text-sm">
            En algunos casos, la confirmación puede demorar unos minutos. 
            Si tenés dudas, contactá a soporte.
          </p>
        </div>

        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
