import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ["/", "/api/auth/login", "/api/auth/registro", "/api/auth/verificar", "/api/auth/recuperar", "/api/auth/restablecer", "/api/webhooks/mercadopago", "/api/rifas"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p)) || pathname.match(/^\/r\//);

  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Token inválido" }, { status: 401 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-role", payload.role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: "/api/:path*",
};
