import Link from "next/link";

async function getRifa(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/rifas/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function RifaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rifa = await getRifa(slug);

  if (!rifa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Rifa no encontrada</h1>
          <Link href="/" className="text-primary hover:underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const soldPercentage = (rifa.soldNumbers / rifa.totalNumbers) * 100;

  return (
    <>
      <header className="glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">RifaPay</Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary">Ingresar</Link>
            <Link href="/register" className="btn-primary text-sm">Crear cuenta</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {rifa.imageUrl && (
              <img src={rifa.imageUrl} alt={rifa.title} className="w-full h-64 object-cover rounded-2xl mb-6" />
            )}
            <h1 className="text-3xl font-bold mb-2">{rifa.title}</h1>
            {rifa.description && <p className="text-gray-600 mb-4">{rifa.description}</p>}

            <div className="glass rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">${Number(rifa.pricePerNumber).toLocaleString("es-AR")}</p>
                  <p className="text-xs text-gray-500">por número</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{rifa.soldNumbers}/{rifa.totalNumbers}</p>
                  <p className="text-xs text-gray-500">vendidos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Date(rifa.drawDate).toLocaleDateString("es-AR")}</p>
                  <p className="text-xs text-gray-500">sorteo</p>
                </div>
                <div>
                  <p className="text-2xl font-bold capitalize">{rifa.status.toLowerCase()}</p>
                  <p className="text-xs text-gray-500">estado</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                <div className="bg-primary h-3 rounded-full" style={{ width: `${soldPercentage}%` }} />
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4">Números disponibles</h2>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {(rifa.numbers as Array<{ id: string; number: number; status: string; buyerName: string | null; paidAt: string | null }>).map((n) => (
                  <div
                    key={n.id}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all ${
                      n.status === "SOLD"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : n.status === "RESERVED"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-white border-2 border-primary/30 hover:border-primary text-gray-700"
                    }`}
                  >
                    {n.number}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Comprar números</h2>
              {rifa.status !== "ACTIVE" ? (
                <p className="text-gray-500 text-sm">Esta rifa no está activa.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Seleccioná los números que querés comprar haciendo clic en ellos.
                  </p>
                  <Link
                    href={`/cart?rifa=${rifa.slug}`}
                    className="btn-primary w-full text-center block"
                  >
                    Ir al carrito
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
