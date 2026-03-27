import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-black text-[#ff5000] leading-none">404</p>
      <h1 className="text-2xl font-black text-gray-900 mt-4 mb-2">Página no encontrada</h1>
      <p className="text-gray-500 font-medium mb-8 max-w-xs">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="bg-[#ff5000] text-white font-black px-8 py-3 rounded-full hover:bg-orange-600 transition-colors shadow-md"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
