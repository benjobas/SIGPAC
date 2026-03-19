"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type AsignarState =
  | { status: "success" }
  | { status: "error"; message: string };

const pacienteIdSchema = z.string().cuid();

export async function asignarPacienteAction(
  pacienteId: string,
): Promise<AsignarState> {
  const session = await auth();
  if (!session?.user?.email) {
    return { status: "error", message: "No autenticado." };
  }

  const parsed = pacienteIdSchema.safeParse(pacienteId);
  if (!parsed.success) {
    return { status: "error", message: "ID de paciente inválido." };
  }

  const alumno = await prisma.alumno.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!alumno) {
    return { status: "error", message: "Tu cuenta de alumno no fue encontrada." };
  }

  // Verify alumno doesn't already have an active assignment
  const asignacionActiva = await prisma.asignacion.findFirst({
    where: {
      alumnoId: alumno.id,
      estado: { in: ["PENDIENTE", "CONTACTADO", "CITA_AGENDADA"] },
    },
  });
  if (asignacionActiva) {
    return {
      status: "error",
      message: "Ya tienes un paciente asignado. Debes liberarlo antes de asignar otro.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Atomic check + update: only succeeds if patient is still DISPONIBLE
      const result = await tx.paciente.updateMany({
        where: { id: parsed.data, estado: "DISPONIBLE" },
        data: { estado: "ASIGNADO" },
      });

      if (result.count === 0) {
        throw new Error("RACE_CONDITION");
      }

      const ahora = new Date();
      // Local testing: 2 minutes. Production: 24 hours.
      const EXPIRY_MS =
        process.env.NODE_ENV === "development"
          ? 2 * 60 * 1000
          : 24 * 60 * 60 * 1000;
      const expiraEn = new Date(ahora.getTime() + EXPIRY_MS);

      await tx.asignacion.create({
        data: {
          pacienteId: parsed.data,
          alumnoId: alumno.id,
          expiraEn,
          estado: "PENDIENTE",
        },
      });
    });

    return { status: "success" };
  } catch (err) {
    if (err instanceof Error && err.message === "RACE_CONDITION") {
      return {
        status: "error",
        message: "Este paciente acaba de ser asignado a otro alumno. Elige otro.",
      };
    }
    return {
      status: "error",
      message: "Ocurrió un error inesperado. Intenta de nuevo.",
    };
  }
}
