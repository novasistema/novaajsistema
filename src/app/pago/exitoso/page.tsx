import Link from 'next/link';

export default function PagoExitosoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-4xl">✓</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-slate-300 mb-8">
          Tu suscripción ha sido activada correctamente. Ya podés comenzar a usar nuestros servicios.
        </p>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
          <p className="text-slate-400 text-sm mb-2">
            Te hemos enviado un email de confirmación con los detalles de tu suscripción.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href="/catalogo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Ver más aplicaciones
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
