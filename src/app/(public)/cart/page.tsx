"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>}>
      <CartContent />
    </Suspense>
  );
}

function CartContent() {
  const searchParams = useSearchParams();
  const rifaSlug = searchParams.get("rifa");

  interface RifaData {
    id: string;
    title: string;
    slug: string;
    pricePerNumber: number;
    totalNumbers: number;
    numbers: Array<{ id: string; number: number; status: string }>;
    status: string;
    drawDate: string;
  }

  const [rifa, setRifa] = useState<RifaData | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (rifaSlug) {
      fetch(`/api/rifas/${rifaSlug}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.ok) setRifa(j.data);
        });
    }
  }, [rifaSlug]);

  const toggleNumber = (num: number) => {
    setSelected((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const total = rifa ? selected.length * Number(rifa.pricePerNumber) : 0;

  const handleCheckout = async () => {
    if (!buyerName.trim() || selected.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rifaSlug,
          numbers: selected,
          buyerName,
          buyerEmail,
          buyerPhone,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || "Error al procesar");
        setLoading(false);
        return;
      }

      const payRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: json.data.transactionId }),
      });
      const payJson = await payRes.json();
      if (!payJson.ok) {
        setError(payJson.error || "Error al crear pago");
        setLoading(false);
        return;
      }

      window.location.href = payJson.data.initPoint;
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  if (!rifa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <>
      <header className="glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">RifaPay</Link>
          <Link href={`/r/${rifaSlug}`} className="text-sm text-gray-500 hover:text-primary">
            Volver a la rifa
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">{rifa.title}</h1>
        <p className="text-gray-500 mb-6">
          Precio: ${Number(rifa.pricePerNumber).toLocaleString("es-AR")} por número
        </p>

        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4">Seleccioná tus números</h2>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {rifa.numbers.map((n) => {
              const isSold = n.status === "SOLD";
              const isSelected = selected.includes(n.number);
              return (
                <button
                  key={n.id}
                  disabled={isSold}
                  onClick={() => toggleNumber(n.number)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    isSold
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : isSelected
                      ? "bg-primary text-white shadow-md"
                      : "bg-white border-2 border-primary/30 hover:border-primary text-gray-700"
                  }`}
                >
                  {n.number}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4">Tus datos</h2>
          <div className="space-y-3">
            <input
              className="input-field"
              placeholder="Nombre completo *"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />
            <input
              className="input-field"
              placeholder="Email"
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
            />
            <input
              className="input-field"
              placeholder="Teléfono"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="glass rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {selected.length} número(s) seleccionado(s)
            </p>
            <p className="text-2xl font-bold text-primary">
              ${total.toLocaleString("es-AR")}
            </p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={selected.length === 0 || !buyerName.trim() || loading}
            className="btn-primary text-lg px-8 py-3"
          >
            {loading ? "Procesando..." : "Pagar con Mercado Pago"}
          </button>
        </div>
      </main>
    </>
  );
}
