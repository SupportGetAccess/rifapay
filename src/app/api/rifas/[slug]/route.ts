import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const rifa = await prisma.rifa.findUnique({
      where: { slug },
      include: {
        user: { select: { id: true, name: true } },
        numbers: {
          orderBy: { number: "asc" },
          select: {
            id: true,
            number: true,
            status: true,
            buyerName: true,
            paidAt: true,
          },
        },
        _count: { select: { numbers: true, transactions: true } },
      },
    });

    if (!rifa) {
      return NextResponse.json({ ok: false, error: "Rifa no encontrada" }, { status: 404 });
    }

    const data = {
      id: rifa.id,
      slug: rifa.slug,
      title: rifa.title,
      description: rifa.description,
      imageUrl: rifa.imageUrl,
      pricePerNumber: Number(rifa.pricePerNumber),
      totalNumbers: rifa.totalNumbers,
      soldNumbers: rifa.numbers.filter((n) => n.status === "SOLD").length,
      drawDate: rifa.drawDate,
      status: rifa.status,
      category: rifa.category,
      allowAffiliates: rifa.allowAffiliates,
      commissionRate: Number(rifa.commissionRate),
      aliasCbu: rifa.aliasCbu,
      creator: rifa.user,
      numbers: rifa.numbers.map((n) => ({
        id: n.id,
        number: n.number,
        status: n.status,
        buyerName: n.buyerName,
        paidAt: n.paidAt,
      })),
    };

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("Get rifa error:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
