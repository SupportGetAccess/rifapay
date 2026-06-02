import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { rifaSlug, numbers, buyerName, buyerPhone, buyerEmail } = await request.json();

    if (!rifaSlug || !numbers || !numbers.length || !buyerName) {
      return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
    }

    const rifa = await prisma.rifa.findUnique({ where: { slug: rifaSlug } });
    if (!rifa) {
      return NextResponse.json({ ok: false, error: "Rifa no encontrada" }, { status: 404 });
    }
    if (rifa.status !== "ACTIVE") {
      return NextResponse.json({ ok: false, error: "Rifa no activa" }, { status: 400 });
    }

    const existing = await prisma.number.findMany({
      where: { rifaId: rifa.id, number: { in: numbers }, status: { not: "AVAILABLE" } },
    });
    if (existing.length > 0) {
      return NextResponse.json({
        ok: false,
        error: `Números no disponibles: ${existing.map((n) => n.number).join(", ")}`,
      }, { status: 409 });
    }

    const amount = Number(rifa.pricePerNumber) * numbers.length;
    const commission = amount * 0.03;
    const netAmount = amount - commission;

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        commission,
        netAmount,
        status: "PENDING",
        buyerName,
        buyerPhone,
        buyerEmail,
        rifaId: rifa.id,
      },
    });

    for (const n of numbers) {
      await prisma.number.updateMany({
        where: { rifaId: rifa.id, number: n, status: "AVAILABLE" },
        data: {
          status: "RESERVED",
          buyerName,
          buyerPhone,
          buyerEmail,
          reservedAt: new Date(),
          transactionId: transaction.id,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        transactionId: transaction.id,
        rifa: { title: rifa.title, slug: rifa.slug },
        amount,
        buyerName,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Cart add error:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
