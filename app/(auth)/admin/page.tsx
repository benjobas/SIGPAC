import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EstadoPaciente, Sede } from "@/app/generated/prisma/client";
import StatsCards from "./_components/StatsCards";
import TablaPacientes from "./_components/TablaPacientes";
import TablaAlumnos from "./_components/TablaAlumnos";
import FiltrosAdmin from "./_components/FiltrosAdmin";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (session?.user?.rol !== "DOCENTE") redirect("/pacientes");

  const sp = await searchParams;
  const vista = sp.vista === "alumnos" ? "alumnos" : "pacientes";

  const estadoParam = typeof sp.estado === "string" ? sp.estado : undefined;
  const sedeParam = typeof sp.sede === "string" ? sp.sede : undefined;
  const desdeParam = typeof sp.desde === "string" ? sp.desde : undefined;

  const whereEstado =
    estadoParam && (Object.values(EstadoPaciente) as string[]).includes(estadoParam)
      ? (estadoParam as EstadoPaciente)
      : undefined;

  const whereSede =
    sedeParam && (Object.values(Sede) as string[]).includes(sedeParam)
      ? (sedeParam as Sede)
      : undefined;

  const desdeDate = desdeParam ? new Date(desdeParam) : undefined;
  const whereDesdeFecha = desdeDate && !isNaN(desdeDate.getTime()) ? desdeDate : undefined;

  // Stats — siempre globales, no cambian con los filtros
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [total, disponibles, asignados, atendidosMes, pacientes, alumnos] = await Promise.all([
    prisma.paciente.count(),
    prisma.paciente.count({ where: { estado: "DISPONIBLE" } }),
    prisma.paciente.count({ where: { estado: "ASIGNADO" } }),
    prisma.paciente.count({ where: { estado: "ATENDIDO", actualizadoEn: { gte: inicioMes } } }),

    prisma.paciente.findMany({
      where: {
        ...(whereEstado && { estado: whereEstado }),
        ...(whereSede && { sedePreferencia: whereSede }),
        ...(whereDesdeFecha && { creadoEn: { gte: whereDesdeFecha } }),
      },
      include: {
        asignaciones: {
          orderBy: { asignadoEn: "desc" },
          take: 1,
          include: { alumno: { select: { nombre: true } } },
        },
      },
      orderBy: { creadoEn: "desc" },
    }),

    prisma.alumno.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        sede: true,
        año: true,
        rol: true,
        _count: { select: { asignaciones: true } },
      },
      orderBy: { asignaciones: { _count: "desc" } },
    }),
  ]);

  const mesActual = new Date().toLocaleDateString("es-CL", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
        <p className="mt-1 text-sm capitalize text-gray-500">{mesActual}</p>
      </div>

      <StatsCards
        total={total}
        disponibles={disponibles}
        asignados={asignados}
        atendidosMes={atendidosMes}
      />

      {/* Tabs de vista */}
      <div className="flex border-b border-gray-200">
        <a
          href="/admin"
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            vista === "pacientes"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pacientes ({pacientes.length})
        </a>
        <a
          href="/admin?vista=alumnos"
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            vista === "alumnos"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Alumnos ({alumnos.length})
        </a>
      </div>

      {vista === "pacientes" ? (
        <div className="space-y-4">
          <FiltrosAdmin />
          <TablaPacientes pacientes={pacientes} />
        </div>
      ) : (
        <TablaAlumnos alumnos={alumnos} />
      )}
    </div>
  );
}
