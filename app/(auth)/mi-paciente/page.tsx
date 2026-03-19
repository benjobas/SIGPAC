import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Countdown } from "./_components/Countdown";
import { AccionesPanel } from "./_components/AccionesPanel";

export const metadata = {
  title: "Mi paciente — SIGPAC USS",
};

const DIAS_LABEL: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
};

const SEDE_LABEL: Record<string, string> = {
  SANTIAGO: "Santiago",
  CONCEPCION: "Concepción",
  VALDIVIA: "Valdivia",
  PATAGONIA: "Patagonia",
};

const ESTADO_LABEL: Record<string, { texto: string; style: string }> = {
  PENDIENTE: { texto: "Pendiente de contacto", style: "bg-gray-100 text-gray-700" },
  CONTACTADO: { texto: "Contactado", style: "bg-blue-100 text-blue-700" },
  CITA_AGENDADA: { texto: "Cita agendada", style: "bg-green-100 text-green-700" },
  NO_RESPONDE: { texto: "No responde", style: "bg-orange-100 text-orange-700" },
};

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <div className="mt-1 text-sm text-gray-800">{children}</div>
    </div>
  );
}

export default async function MiPacientePage() {
  const session = await auth();

  const alumno = await prisma.alumno.findUnique({
    where: { email: session!.user!.email! },
    select: { id: true },
  });

  const asignacion = alumno
    ? await prisma.asignacion.findFirst({
        where: {
          alumnoId: alumno.id,
          estado: { in: ["PENDIENTE", "CONTACTADO", "CITA_AGENDADA", "NO_RESPONDE"] },
        },
        include: {
          paciente: {
            select: {
              nombre: true,
              edad: true,
              telefono: true,
              email: true,
              comuna: true,
              motivoConsulta: true,
              disponibilidad: true,
              sedePreferencia: true,
            },
          },
        },
        orderBy: { asignadoEn: "desc" },
      })
    : null;

  if (!asignacion) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-gray-700">No tienes un paciente asignado</p>
        <p className="mt-2 text-sm text-gray-500 max-w-xs">
          Busca un paciente disponible y asígnatelo para comenzar el proceso clínico.
        </p>
        <Link
          href="/pacientes"
          className="mt-6 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Ver pacientes disponibles
        </Link>
      </div>
    );
  }

  const { paciente, estado, expiraEn, id: asignacionId, asignadoEn } = asignacion;
  const estadoInfo = ESTADO_LABEL[estado] ?? { texto: estado, style: "bg-gray-100 text-gray-700" };

  const disponibilidad = (paciente.disponibilidad ?? {}) as Record<string, string[]>;
  const diasEntries = Object.entries(disponibilidad).filter(([, slots]) => slots.length > 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mi paciente</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoInfo.style}`}>
          {estadoInfo.texto}
        </span>
      </div>

      {/* Countdown */}
      <Countdown expiraEn={expiraEn.toISOString()} />

      {/* Datos del paciente */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-gray-900 text-base">Datos del paciente</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Campo label="Nombre completo">
            <span className="font-medium">{paciente.nombre}</span>
          </Campo>

          <Campo label="Edad">
            {paciente.edad} años
          </Campo>

          <Campo label="Teléfono">
            <a
              href={`tel:${paciente.telefono}`}
              className="text-blue-600 hover:underline"
            >
              {paciente.telefono}
            </a>
          </Campo>

          <Campo label="Email">
            {paciente.email ? (
              <a
                href={`mailto:${paciente.email}`}
                className="text-blue-600 hover:underline break-all"
              >
                {paciente.email}
              </a>
            ) : (
              <span className="text-gray-400">No indicado</span>
            )}
          </Campo>

          <Campo label="Comuna">
            {paciente.comuna}
          </Campo>

          <Campo label="Sede de preferencia">
            {SEDE_LABEL[paciente.sedePreferencia] ?? paciente.sedePreferencia}
          </Campo>
        </div>

        <Campo label="Motivo de consulta">
          <p className="leading-relaxed">{paciente.motivoConsulta}</p>
        </Campo>

        <Campo label="Disponibilidad horaria">
          <div className="flex flex-wrap gap-1.5 mt-1">
            {diasEntries.length === 0 ? (
              <span className="text-gray-400">Sin horario registrado</span>
            ) : (
              diasEntries.map(([dia, slots]) =>
                slots.map((slot) => (
                  <span
                    key={`${dia}-${slot}`}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {DIAS_LABEL[dia] ?? dia} {slot.toUpperCase()}
                  </span>
                )),
              )
            )}
          </div>
        </Campo>
      </div>

      {/* Acciones */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900 text-base">Registrar avance</h2>
          <p className="mt-1 text-xs text-gray-500">
            Asignado el {new Date(asignadoEn).toLocaleDateString("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {estado === "CITA_AGENDADA" ? (
          <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-medium">
            Cita agendada. Tu docente registrará la atención una vez completada.
          </p>
        ) : (
          <AccionesPanel asignacionId={asignacionId} estadoActual={estado} />
        )}
      </div>
    </div>
  );
}
