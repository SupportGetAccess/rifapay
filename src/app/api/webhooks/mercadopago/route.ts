import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type !== "payment" || !data?.id) {
      return NextResponse.json({ ok: true });
    }

    const paymentId = data.id.toString();
    const payment = await getPayment(paymentId);

    const externalReference = payment.external_reference;
    if (!externalReference) {
      return NextResponse.json({ ok: true });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: externalReference },
      include: { numbers: true },
    });

    if (!transaction) {
      return NextResponse.json({ ok: false, error: "Transacción no encontrada" }, { status: 404 });
    }

    const newStatus = payment.status === "approved" ? "APPROVED"
                    : payment.status === "rejected" || payment.status === "cancelled" ? "REJECTED"
                    : "PENDING";

    if (newStatus === "APPROVED") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          mpPaymentId: paymentId,
          status: newStatus,
          numbers: {
            updateMany: {
              where: { transactionId: transaction.id },
              data: { status: "SOLD", paidAt: new Date() },
            },
          },
        },
      });
    } else if (newStatus === "REJECTED") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { mpPaymentId: paymentId, status: newStatus },
      });

      await prisma.number.updateMany({
        where: { transactionId: transaction.id },
        data: { status: "AVAILABLE", buyerName: null, buyerPhone: null, buyerEmail: null, reservedAt: null, transactionId: null },
      });
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { mpPaymentId: paymentId, status: newStatus },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
