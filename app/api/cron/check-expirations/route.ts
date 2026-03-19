import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

// Prevent Next.js from caching this route
export const dynamic = "force-dynamic";

// Local testing: set to 2 minutes instead of 24h / 48h
const IS_DEV = process.env.NODE_ENV === "development";
const LIMITE_NO_RESPONDE_MS = IS_DEV
  ? 2 * 60 * 1000          // 2 minutes (local testing)
  : 48 * 60 * 60 * 1000;   // 48 hours (production)

export async function GET(request: NextRequest) {
  // Auth: Vercel sends Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ahora = new Date();
  const limiteNoResponde = new Date(ahora.getTime() - LIMITE_NO_RESPONDE_MS);

  // ── 1. PENDIENTE with expiraEn < now ─────────────────────────────────────
  // The student never contacted the patient within the allowed window.
  // → Mark assignment NO_RESPONDE and free the patient.
  const pendientesVencidos = await prisma.asignacion.findMany({
    where: {
      estado: "PENDIENTE",
      expiraEn: { lt: ahora },
    },
    select: { id: true, pacienteId: true },
  });

  const idsPendientes = pendientesVencidos.map((a) => a.id);
  const pacienteIdsPendientes = pendientesVencidos.map((a) => a.pacienteId);

  // ── 2. NO_RESPONDE with actualizadoEn < now - 48h ────────────────────────
  // The student marked the patient as not responding; after the wait window
  // the patient is freed so other students can claim them.
  const noRespondeVencidos = await prisma.asignacion.findMany({
    where: {
      estado: "NO_RESPONDE",
      actualizadoEn: { lt: limiteNoResponde },
    },
    select: { id: true, pacienteId: true },
  });

  const pacienteIdsNoResponde = noRespondeVencidos.map((a) => a.pacienteId);

  // Run all updates atomically
  const [liberadosPendiente, liberadosNoResponde, asignacionesMarcadas] =
    await prisma.$transaction([
      // Free patients from expired PENDIENTE assignments.
      // Guard: only update patients still in ASIGNADO state so we don't
      // accidentally clobber a patient that was already re-assigned.
      prisma.paciente.updateMany({
        where: {
          id: { in: pacienteIdsPendientes },
          estado: "ASIGNADO",
        },
        data: { estado: "DISPONIBLE" },
      }),

      // Free patients from timed-out NO_RESPONDE assignments.
      // Guard: only update patients still in NO_RESPONDE state.
      prisma.paciente.updateMany({
        where: {
          id: { in: pacienteIdsNoResponde },
          estado: "NO_RESPONDE",
        },
        data: { estado: "DISPONIBLE" },
      }),

      // Mark the expired PENDIENTE assignments as NO_RESPONDE so the
      // student's slot is freed (mi-paciente only shows active assignments
      // where estado != NO_RESPONDE in the asignar-check query).
      prisma.asignacion.updateMany({
        where: { id: { in: idsPendientes } },
        data: { estado: "NO_RESPONDE" },
      }),
    ]);

  return Response.json({
    ok: true,
    timestamp: ahora.toISOString(),
    modo: IS_DEV ? "desarrollo (2 min)" : "producción (24h/48h)",
    pendientesVencidos: {
      asignaciones: asignacionesMarcadas.count,
      pacientesLiberados: liberadosPendiente.count,
    },
    noRespondeVencidos: {
      pacientesLiberados: liberadosNoResponde.count,
    },
  });
}
