import Link from "next/link";

export default function CartPending() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass rounded-2xl p-8 text-center max-w-md mx-4">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Pago pendiente</h1>
        <p className="text-gray-600 mb-6">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
        </p>
        <Link href="/" className="btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
