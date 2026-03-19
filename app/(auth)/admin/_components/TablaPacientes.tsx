type AsignacionFila = {
  asignadoEn: Date;
  alumno: { nombre: string };
};

type PacienteFila = {
  id: string;
  nombre: string;
  rut: string;
  motivoConsulta: string;
  sedePreferencia: string;
  estado: string;
  creadoEn: Date;
  asignaciones: AsignacionFila[];
};

const ESTADO_BADGE: Record<string, { label: string; className: string }> = {
  DISPONIBLE:    { label: "Disponible",    className: "bg-green-100 text-green-700" },
  ASIGNADO:      { label: "Asignado",      className: "bg-blue-100 text-blue-700" },
  EN_CONTACTO:   { label: "En contacto",   className: "bg-yellow-100 text-yellow-700" },
  CITA_AGENDADA: { label: "Cita agendada", className: "bg-purple-100 text-purple-700" },
  NO_RESPONDE:   { label: "No responde",   className: "bg-red-100 text-red-700" },
  ATENDIDO:      { label: "Atendido",      className: "bg-gray-100 text-gray-600" },
};

const SEDE_LABEL: Record<string, string> = {
  SANTIAGO:   "Santiago",
  CONCEPCION: "Concepción",
  VALDIVIA:   "Valdivia",
  PATAGONIA:  "Patagonia",
};

function fmtDate(date: Date) {
  return new Date(date).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function TablaPacientes({ pacientes }: { pacientes: PacienteFila[] }) {
  if (pacientes.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-400">
        No hay pacientes que coincidan con los filtros aplicados.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3">Paciente</th>
            <th className="px-4 py-3">Motivo de consulta</th>
            <th className="px-4 py-3">Sede</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Alumno asignado</th>
            <th className="px-4 py-3">Fecha asig.</th>
            <th className="px-4 py-3">Registro</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pacientes.map((p) => {
            const asignacion = p.asignaciones[0];
            const badge = ESTADO_BADGE[p.estado] ?? { label: p.estado, className: "bg-gray-100 text-gray-600" };
            return (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{p.nombre}</p>
                  <p className="text-xs text-gray-400">{p.rut}</p>
                </td>
                <td className="max-w-xs px-4 py-3 text-gray-600">
                  <span title={p.motivoConsulta}>
                    {p.motivoConsulta.length > 60
                      ? p.motivoConsulta.slice(0, 60) + "…"
                      : p.motivoConsulta}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {SEDE_LABEL[p.sedePreferencia] ?? p.sedePreferencia}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {asignacion ? asignacion.alumno.nombre : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {asignacion ? fmtDate(asignacion.asignadoEn) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500">{fmtDate(p.creadoEn)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
