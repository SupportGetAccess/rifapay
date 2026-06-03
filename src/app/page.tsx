import Link from "next/link";

interface RifaItem {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  pricePerNumber: number;
  totalNumbers: number;
  soldNumbers: number;
  drawDate: string;
  status: string;
}

async function getRifas(): Promise<RifaItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/rifas`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const rifas = await getRifas();

  return (
    <>
      <header className="glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            RifaPay
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary">
              Ingresar
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 py-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comprá y vendé rifas online
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              La forma más fácil de participar en rifas y vender números. Pagá con Mercado Pago al instante.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="#rifas" className="btn-primary">
                Explorar rifas
              </Link>
              <Link href="/api/auth/registro" className="btn-outline">
                Crear mi rifa
              </Link>
            </div>
          </div>
        </section>

        <section id="rifas" className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-8">Rifas activas</h2>
          {rifas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No hay rifas activas por ahora.</p>
              <Link href="/api/auth/registro" className="text-primary font-medium hover:underline mt-2 inline-block">
                Creá la primera
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rifas.map((rifa) => (
                <Link
                  key={rifa.id}
                  href={`/r/${rifa.slug}`}
                  className="glass rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  {rifa.imageUrl && (
                    <img src={rifa.imageUrl} alt={rifa.title} className="w-full h-40 object-cover rounded-xl mb-4" />
                  )}
                  <h3 className="font-semibold text-lg mb-2">{rifa.title}</h3>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>${(rifa.pricePerNumber).toLocaleString("es-AR")} c/u</span>
                    <span>{rifa.soldNumbers}/{rifa.totalNumbers} vendidos</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(rifa.soldNumbers / rifa.totalNumbers) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Sorteo: {new Date(rifa.drawDate).toLocaleDateString("es-AR")}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} RifaPay. Todos los derechos reservados.</p>
      </footer>
    </>
  );
}
