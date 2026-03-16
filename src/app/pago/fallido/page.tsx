import Link from 'next/link';

export default function PagoFallidoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-4xl">✕</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Pago Fallido
        </h1>
        
        <p className="text-slate-300 mb-8">
          Hubo un problema al procesar tu pago. Por favor intentá nuevamente o contactá a soporte.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/catalogo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Volver a intentar
          </Link>
          <Link
            href="/"
            className="border border-slate-600 text-slate-300 hover:text-white hover:border-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
