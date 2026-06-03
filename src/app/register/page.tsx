"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const json = await res.json();

      if (!json.ok) {
        setError(json.error || "Error al registrarse");
        return;
      }

      setStep("verify");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
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
          {step === "register" ? (
            <>
              <h1 className="text-xl font-bold mb-6 text-center">Crear cuenta</h1>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nombre</label>
                  <input
                    className="input-field"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
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
                  <label className="text-sm font-medium text-gray-700 block mb-1">Contraseña</label>
                  <input
                    className="input-field"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </form>
              <p className="text-sm text-gray-500 text-center mt-6">
                ¿Ya tenés cuenta?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-2 text-center">Verificá tu email</h1>
              <p className="text-sm text-gray-500 text-center mb-6">
                Ingresá el código de 6 caracteres que enviamos a <strong>{email}</strong>
              </p>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
