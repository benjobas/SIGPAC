"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type AccionState =
  | { status: "success" }
  | { status: "error"; message: string };

const asignacionIdSchema = z.string().cuid();

type TransicionArgs = {
  asignacionId: string;
  nuevoEstadoAsignacion: "CONTACTADO" | "CITA_AGENDADA" | "NO_RESPONDE";
  nuevoEstadoPaciente: "EN_CONTACTO" | "CITA_AGENDADA" | "NO_RESPONDE";
};

async function ejecutarTransicion({
  asignacionId,
  nuevoEstadoAsignacion,
  nuevoEstadoPaciente,
}: TransicionArgs): Promise<AccionState> {
  const session = await auth();
  if (!session?.user?.email) {
    return { status: "error", message: "No autenticado." };
  }

  const parsed = asignacionIdSchema.safeParse(asignacionId);
  if (!parsed.success) {
    return { status: "error", message: "ID de asignación inválido." };
  }

  const alumno = await prisma.alumno.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!alumno) {
    return { status: "error", message: "Tu cuenta de alumno no fue encontrada." };
  }

  // Verify the assignment belongs to this alumno (authorization check)
  const asignacion = await prisma.asignacion.findFirst({
    where: { id: parsed.data, alumnoId: alumno.id },
    select: { id: true, pacienteId: true },
  });
  if (!asignacion) {
    return { status: "error", message: "Asignación no encontrada." };
  }

  try {
    await prisma.$transaction([
      prisma.asignacion.update({
        where: { id: asignacion.id },
        data: { estado: nuevoEstadoAsignacion },
      }),
      prisma.paciente.update({
        where: { id: asignacion.pacienteId },
        data: { estado: nuevoEstadoPaciente },
      }),
    ]);

    return { status: "success" };
  } catch {
    return { status: "error", message: "Ocurrió un error inesperado. Intenta de nuevo." };
  }
}

export async function contactadoAction(asignacionId: string): Promise<AccionState> {
  return ejecutarTransicion({
    asignacionId,
    nuevoEstadoAsignacion: "CONTACTADO",
    nuevoEstadoPaciente: "EN_CONTACTO",
  });
}

export async function citaAgendadaAction(asignacionId: string): Promise<AccionState> {
  return ejecutarTransicion({
    asignacionId,
    nuevoEstadoAsignacion: "CITA_AGENDADA",
    nuevoEstadoPaciente: "CITA_AGENDADA",
  });
}

export async function noRespondeAction(asignacionId: string): Promise<AccionState> {
  return ejecutarTransicion({
    asignacionId,
    nuevoEstadoAsignacion: "NO_RESPONDE",
    nuevoEstadoPaciente: "NO_RESPONDE",
  });
}
