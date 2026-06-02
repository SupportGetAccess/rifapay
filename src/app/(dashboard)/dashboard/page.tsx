"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  stats: { activeRifas: number; totalRifas: number; totalSold: number; totalRevenue: number };
  rifas: Array<{ id: string; title: string; status: string; numbers: unknown[]; _count: { numbers: number } }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((j: { ok: boolean; data?: DashboardStats }) => {
          if (j.ok && j.data) setData(j.data);
        });
    }
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-gray-500">Rifas activas</p>
          <p className="text-3xl font-bold text-primary">{stats.activeRifas}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-gray-500">Total rifas</p>
          <p className="text-3xl font-bold">{stats.totalRifas}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-gray-500">Números vendidos</p>
          <p className="text-3xl font-bold text-secondary">{stats.totalSold}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-gray-500">Ingresos</p>
          <p className="text-3xl font-bold">${Number(stats.totalRevenue).toLocaleString("es-AR")}</p>
        </div>
      </div>

      <h2 className="font-semibold text-lg mb-4">Tus rifas</h2>
      <div className="space-y-3">
        {data.rifas.map((rifa) => (
          <div key={rifa.id} className="glass rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{rifa.title}</p>
              <p className="text-sm text-gray-500">
                {rifa.numbers.length}/{rifa._count.numbers} números vendidos
              </p>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
              rifa.status === "ACTIVE" ? "bg-green-100 text-green-700"
              : rifa.status === "DRAFT" ? "bg-gray-100 text-gray-600"
              : "bg-yellow-100 text-yellow-700"
            }`}>
              {rifa.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
