import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    if (user.verifyCode !== code) {
      return NextResponse.json({ ok: false, error: "Código incorrecto" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { verified: true, verifyCode: null },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    return NextResponse.json({
      ok: true,
      data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
    });
  } catch (error) {
    console.error("Verificar error:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
