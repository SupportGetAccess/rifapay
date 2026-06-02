import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPreference } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json({ ok: false, error: "Falta transactionId" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { rifa: true, numbers: true },
    });

    if (!transaction) {
      return NextResponse.json({ ok: false, error: "Transacción no encontrada" }, { status: 404 });
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json({ ok: false, error: "Transacción ya procesada" }, { status: 400 });
    }

    const preference = await createPreference({
      items: [
        {
          title: `${transaction.rifa.title} - ${transaction.numbers.length} número(s)`,
          quantity: 1,
          unit_price: Number(transaction.amount),
          currency_id: "ARS",
        },
      ],
      externalReference: transaction.id,
      payerEmail: transaction.buyerEmail || undefined,
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { mpPreferenceId: preference.id },
    });

    return NextResponse.json({
      ok: true,
      data: {
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json({ ok: false, error: "Error al crear pago" }, { status: 500 });
  }
}
