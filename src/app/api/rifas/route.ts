import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RifaRow = {
  id: string; slug: string; title: string; imageUrl: string | null;
  pricePerNumber: unknown; totalNumbers: number;
  numbers: { id: string }[]; drawDate: unknown; status: string; category: string | null;
  _count: { numbers: number };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get("x-user-id");
    const category = searchParams.get("categoria");
    const search = searchParams.get("busqueda");

    const where: Record<string, unknown> = { status: "ACTIVE" };

    if (category) where.category = category;
    if (search) where.title = { contains: search, mode: "insensitive" as const };
    if (searchParams.get("mis_eventos") && userId) {
      where.userId = userId;
      delete where.status;
    }

    const rifas = await prisma.rifa.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: where as any,
      include: {
        _count: { select: { numbers: true } },
        numbers: {
          where: { status: "SOLD" },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const data = (rifas as RifaRow[]).map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      imageUrl: r.imageUrl,
      pricePerNumber: Number(r.pricePerNumber),
      totalNumbers: r.totalNumbers,
      soldNumbers: r.numbers.length,
      drawDate: r.drawDate,
      status: r.status,
      category: r.category,
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("List rifas error:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

    const rifa = await prisma.rifa.create({
      data: {
        slug,
        status: "ACTIVE",
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        pricePerNumber: body.pricePerNumber,
        totalNumbers: body.totalNumbers,
        drawDate: new Date(body.drawDate),
        startDate: new Date(),
        category: body.category,
        allowAffiliates: body.allowAffiliates || false,
        commissionRate: body.commissionRate || 0.03,
        aliasCbu: body.aliasCbu,
        userId,
      },
    });

    const numbers = Array.from({ length: body.totalNumbers }, (_, i) => ({
      number: i + 1,
      status: "AVAILABLE" as const,
      rifaId: rifa.id,
    }));

    await prisma.number.createMany({ data: numbers });

    return NextResponse.json({ ok: true, data: rifa }, { status: 201 });
  } catch (error) {
    console.error("Create rifa error:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
