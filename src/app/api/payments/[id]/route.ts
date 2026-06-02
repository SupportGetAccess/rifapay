import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        rifa: { select: { title: true, slug: true } },
        numbers: { select: { number: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ ok: false, error: "Transacción no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: transaction });
  } catch (error) {
    console.error("Get payment error:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
