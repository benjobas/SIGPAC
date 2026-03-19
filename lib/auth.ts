import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "./auth.config";
import { prisma } from "./db";

const isDev = process.env.NODE_ENV === "development";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.AUTH_EMAIL_FROM ?? "SIGPAC USS <noreply@correo.uss.cl>",
      // En desarrollo: imprime el magic link en consola en vez de enviar email
      ...(isDev && {
        sendVerificationRequest({ url, identifier }) {
          console.log("\n========== MAGIC LINK (dev) ==========");
          console.log(`Email: ${identifier}`);
          console.log(`URL:   ${url}`);
          console.log("======================================\n");
        },
      }),
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user }) {
      const email = user.email;
      if (!email?.endsWith("@correo.uss.cl")) return false;
      const alumno = await prisma.alumno.findUnique({ where: { email } });
      if (!alumno) return false;
      return true;
    },

    async jwt({ token, user }) {
      // Solo en el primer sign-in (user viene poblado)
      if (user?.email) {
        const alumno = await prisma.alumno.findUnique({
          where: { email: user.email },
          select: { rol: true, sede: true, nombre: true },
        });
        if (alumno) {
          token.rol = alumno.rol;
          token.sede = alumno.sede;
          token.nombre = alumno.nombre;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.rol) session.user.rol = token.rol as string;
      if (token.sede) session.user.sede = token.sede as string;
      if (token.nombre) session.user.name = token.nombre as string;
      return session;
    },
  },
});
