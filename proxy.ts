import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Proxy de Next.js 16 (antes: middleware).
 * Usa solo auth.config (sin Prisma) para ser edge-compatible.
 * La sesión se valida por JWT sin tocar la DB.
 */
export const proxy = auth;

export const config = {
  matcher: [
    "/pacientes/:path*",
    "/mi-paciente/:path*",
    "/admin/:path*",
  ],
};
