import type { NextAuthConfig } from "next-auth";

/**
 * Configuración edge-safe: sin imports de Prisma.
 * Usada por el middleware para validar la sesión JWT sin tocar la DB.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const protectedPaths = ["/pacientes", "/mi-paciente", "/admin"];
      const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

      if (isProtected) return isLoggedIn;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
