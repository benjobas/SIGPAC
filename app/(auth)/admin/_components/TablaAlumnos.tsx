type AlumnoFila = {
  id: string;
  nombre: string;
  email: string;
  sede: string;
  año: number;
  rol: string;
  _count: { asignaciones: number };
};

const SEDE_LABEL: Record<string, string> = {
  SANTIAGO:   "Santiago",
  CONCEPCION: "Concepción",
  VALDIVIA:   "Valdivia",
  PATAGONIA:  "Patagonia",
};

export default function TablaAlumnos({ alumnos }: { alumnos: AlumnoFila[] }) {
  if (alumnos.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-400">
        No hay alumnos registrados.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3">Alumno</th>
            <th className="px-4 py-3">Sede</th>
            <th className="px-4 py-3">Año</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3 text-right">Pacientes gestionados</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {alumnos.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{a.nombre}</p>
                <p className="text-xs text-gray-400">{a.email}</p>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {SEDE_LABEL[a.sede] ?? a.sede}
              </td>
              <td className="px-4 py-3 text-gray-600">{a.año}°</td>
              <td className="px-4 py-3">
                {a.rol === "DOCENTE" ? (
                  <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                    Docente
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    Estudiante
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="tabular-nums font-semibold text-gray-900">
                  {a._count.asignaciones}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
