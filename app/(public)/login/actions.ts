"use server";

import { z } from "zod";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type LoginState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const emailSchema = z.string().email("Email inválido.");

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = formData.get("email");

  const parsed = emailSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Ingresa un email válido." };
  }

  const email = parsed.data.toLowerCase().trim();

  if (!email.endsWith("@correo.uss.cl")) {
    return {
      status: "error",
      message: "Solo puedes ingresar con un email @correo.uss.cl.",
    };
  }

  const alumno = await prisma.alumno.findUnique({ where: { email } });
  if (!alumno) {
    return {
      status: "error",
      message: "Este email no está registrado en el sistema. Contacta a tu docente.",
    };
  }

  try {
    await signIn("resend", { email, redirect: false });
    return { status: "success" };
  } catch {
    return {
      status: "error",
      message: "No se pudo enviar el email. Intenta de nuevo.",
    };
  }
}
