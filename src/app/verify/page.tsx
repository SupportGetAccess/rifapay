"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const json = await res.json();

      if (!json.ok) {
        setError(json.error || "Código incorrecto");
        return;
      }

      localStorage.setItem("token", json.data.token);
      router.push("/dashboard");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-2xl font-bold text-primary text-center block mb-8">
          RifaPay
        </Link>
        <div className="glass rounded-2xl p-8">
          <h1 className="text-xl font-bold mb-2 text-center">Verificá tu email</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Ingresá tu email y el código que recibiste
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Código de verificación</label>
              <input
                className="input-field text-center text-2xl tracking-widest"
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                maxLength={6}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Verificando..." : "Verificar"}
            </button>
          </form>
          <p className="text-sm text-gray-500 text-center mt-6">
            <Link href="/register" className="text-primary font-medium hover:underline">
              Crear una cuenta nueva
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
