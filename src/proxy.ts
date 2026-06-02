import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const authBypassPaths = ["/api/auth/login", "/api/auth/registro", "/api/auth/verificar", "/api/auth/recuperar", "/api/auth/restablecer", "/api/webhooks/mercadopago", "/api/payments/create", "/api/cart/add"];
  const publicGetPaths = ["/api/rifas"];
  const bypassAuth = authBypassPaths.some((p) => pathname.startsWith(p));
  const isPublicGet = publicGetPaths.some((p) => pathname.startsWith(p)) && method === "GET";
  const isPublicRoute = pathname === "/" || pathname.match(/^\/r\//) || bypassAuth || isPublicGet;

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  let userId: string | null = null;
  let userRole: string | null = null;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      userId = payload.userId;
      userRole = payload.role;
    }
  }

  if (!isPublicRoute && !userId) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  if (userId) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", userId);
    if (userRole) requestHeaders.set("x-user-role", userRole);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
