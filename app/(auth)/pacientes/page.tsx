import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PacientesClient } from "./_components/PacientesClient";

export const metadata = {
  title: "Pacientes disponibles — SIGPAC USS",
};

export default async function PacientesPage() {
  const session = await auth();

  const pacientes = await prisma.paciente.findMany({
    where: { estado: "DISPONIBLE" },
    select: {
      id: true,
      nombre: true,
      edad: true,
      comuna: true,
      motivoConsulta: true,
      disponibilidad: true,
      sedePreferencia: true,
    },
    orderBy: { creadoEn: "desc" },
  });

  // Cast Prisma's JsonValue to the expected shape
  const pacientesSerializados = pacientes.map((p) => ({
    ...p,
    disponibilidad: (p.disponibilidad ?? {}) as Record<string, string[]>,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Pacientes disponibles</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenido/a, {session?.user?.name ?? session?.user?.email}. Asígnate un
          paciente para comenzar el proceso clínico.
        </p>
      </div>
      <PacientesClient pacientes={pacientesSerializados} />
    </div>
  );
}
