import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const rifas = await prisma.rifa.findMany({
      where: { userId },
      include: {
        _count: { select: { numbers: true } },
        numbers: {
          where: { status: "SOLD" },
          select: { id: true },
        },
        transactions: {
          select: { amount: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      totalRifas: rifas.length,
      activeRifas: rifas.filter((r) => r.status === "ACTIVE").length,
      totalSold: rifas.reduce((sum, r) => sum + r.numbers.length, 0),
      totalRevenue: rifas.reduce(
        (sum, r) =>
          sum + r.transactions.filter((t) => t.status === "APPROVED").reduce((s, t) => s + Number(t.amount), 0),
        0
      ),
    };

    return NextResponse.json({ ok: true, data: { stats, rifas } });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
