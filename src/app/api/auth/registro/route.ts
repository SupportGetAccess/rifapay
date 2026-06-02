import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateCode } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "El email ya está registrado" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const code = generateCode();

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        verifyCode: code,
      },
    });

    return NextResponse.json({ ok: true, data: { message: "Usuario creado. Revisá tu email para verificar.", code } }, { status: 201 });
  } catch (error) {
    console.error("Registro error:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
